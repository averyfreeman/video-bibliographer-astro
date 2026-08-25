import { describe, expect, it } from 'vitest';
import {
  extractYouTubeId,
  fetchYouTubeTranscript,
  normalizeYouTubeUrl,
} from '../../src/lib/youtube';
import { YouTubeTranscriptError } from '../../src/lib/youtube/errors';
import type { TranscriptProvider } from '../../src/lib/youtube/provider';
import { createYtDlpTranscriptProvider } from '../../src/lib/youtube/yt-dlp-provider';

describe('YouTube URL normalization', () => {
  it('keeps a canonical video URL and parses a start-time parameter', () => {
    expect(normalizeYouTubeUrl('https://www.youtube.com/watch?v=t38LbMVoPCs&t=1h2m3s')).toEqual({
      videoId: 't38LbMVoPCs',
      canonicalUrl: 'https://www.youtube.com/watch?v=t38LbMVoPCs',
      startSeconds: 3723,
    });
  });

  it('rejects playlist-only and deceptive-host URLs', () => {
    expect(normalizeYouTubeUrl('https://www.youtube.com/playlist?list=PLdemo')).toBeNull();
    expect(normalizeYouTubeUrl('https://youtube.com.evil.test/watch?v=t38LbMVoPCs')).toBeNull();
    expect(normalizeYouTubeUrl('https://www.youtube.com/watch?v=t38LbMVoPCs')).toEqual({
      videoId: 't38LbMVoPCs',
      canonicalUrl: 'https://www.youtube.com/watch?v=t38LbMVoPCs',
    });
    expect(extractYouTubeId('https://www.youtube.com/watch?list=PLdemo')).toBeNull();
  });
});

describe('injectable transcript provider', () => {
  it('passes only the validated ID and returns timestamped cues', async () => {
    const requests: Array<{ videoId: string; hasSignal: boolean }> = [];
    const provider: TranscriptProvider = {
      getTranscript: async ({ videoId, signal }) => {
        requests.push({ videoId, hasSignal: signal instanceof AbortSignal });
        return {
          title: 'Fixture video',
          language: 'en',
          source: 'manual',
          cues: [{ start: 12.5, text: 'A verified cue.' }],
        };
      },
    };

    await expect(fetchYouTubeTranscript('https://youtu.be/t38LbMVoPCs?t=12', { provider })).resolves.toEqual({
      videoUrl: 'https://www.youtube.com/watch?v=t38LbMVoPCs',
      title: 'Fixture video',
      cues: [{ start: 12.5, text: 'A verified cue.' }],
      language: 'en',
      source: 'manual',
    });
    expect(requests).toEqual([{ videoId: 't38LbMVoPCs', hasSignal: true }]);
  });

  it('classifies provider errors without fabricating a transcript', async () => {
    const provider: TranscriptProvider = {
      getTranscript: async () => {
        throw new YouTubeTranscriptError('private', 'The video is private.');
      },
    };

    await expect(fetchYouTubeTranscript('https://www.youtube.com/watch?v=t38LbMVoPCs', { provider }))
      .rejects.toMatchObject({ code: 'private', message: 'The video is private.' });
  });

  it('classifies a provider timeout when the injected provider does not settle', async () => {
    const provider: TranscriptProvider = {
      getTranscript: (_request) => new Promise(() => undefined),
    };

    await expect(fetchYouTubeTranscript('https://www.youtube.com/watch?v=t38LbMVoPCs', { provider, timeoutMs: 5 }))
      .rejects.toMatchObject({ code: 'timeout' });
  });
});

describe('yt-dlp transcript provider', () => {
  it('uses the canonical video URL, parses JSON3 cues, and prefers manual English captions', async () => {
    const calls: string[][] = [];
    const provider = createYtDlpTranscriptProvider({
      execute: async (args) => {
        calls.push(args);
        return {
          stdout: JSON.stringify({
            id: 't38LbMVoPCs',
            title: 'Fixture video',
            subtitles: { en: [{ url: 'https://www.youtube.com/api/timedtext?lang=en', ext: 'json3' }] },
            automatic_captions: { en: [{ url: 'https://www.youtube.com/api/timedtext?lang=en&auto=1', ext: 'json3' }] },
          }),
          stderr: '',
        };
      },
      fetchCaption: async () => new Response(JSON.stringify({
        events: [
          { tStartMs: 1500, segs: [{ utf8: ' First ' }, { utf8: 'cue. ' }] },
          { tStartMs: 3500, segs: [{ utf8: 'Second cue.' }] },
        ],
      }), { status: 200 }),
    });

    await expect(provider.getTranscript({ videoId: 't38LbMVoPCs', signal: new AbortController().signal })).resolves.toEqual({
      title: 'Fixture video',
      language: 'en',
      source: 'manual',
      cues: [
        { start: 1.5, text: 'First cue.' },
        { start: 3.5, text: 'Second cue.' },
      ],
    });
    expect(calls[0]).toContain('https://www.youtube.com/watch?v=t38LbMVoPCs');
  });

  it.each([
    ['private', 'ERROR: Sign in to confirm you’re not a bot'],
    ['rate-limited', 'HTTP Error 429: Too Many Requests'],
    ['timeout', 'The operation timed out'],
  ] as const)('maps %s provider failures to a stable error code', async (code, message) => {
    const provider = createYtDlpTranscriptProvider({
      execute: async () => {
        const error = new Error(message) as Error & { code?: string };
        if (code === 'timeout') error.code = 'ETIMEDOUT';
        throw error;
      },
    });

    await expect(provider.getTranscript({ videoId: 't38LbMVoPCs', signal: new AbortController().signal }))
      .rejects.toMatchObject({ code });
  });

  it('classifies stderr emitted by yt-dlp instead of exposing raw provider output', async () => {
    const provider = createYtDlpTranscriptProvider({
      execute: async () => {
        const error = new Error('Command failed') as Error & { stderr?: string };
        error.stderr = 'ERROR: This video is private';
        throw error;
      },
    });

    await expect(provider.getTranscript({ videoId: 't38LbMVoPCs', signal: new AbortController().signal }))
      .rejects.toMatchObject({ code: 'private', message: 'The video is private or requires account access.' });
  });

  it('classifies captionless and empty tracks distinctly', async () => {
    const noCaptions = createYtDlpTranscriptProvider({
      execute: async () => ({ stdout: JSON.stringify({ title: 'No captions' }), stderr: '' }),
    });
    await expect(noCaptions.getTranscript({ videoId: 't38LbMVoPCs', signal: new AbortController().signal }))
      .rejects.toMatchObject({ code: 'captionless' });

    const emptyTrack = createYtDlpTranscriptProvider({
      execute: async () => ({
        stdout: JSON.stringify({
          title: 'Empty track',
          subtitles: { en: [{ url: 'https://www.youtube.com/api/timedtext?lang=en', ext: 'json3' }] },
        }),
        stderr: '',
      }),
      fetchCaption: async () => new Response(JSON.stringify({ events: [] }), { status: 200 }),
    });
    await expect(emptyTrack.getTranscript({ videoId: 't38LbMVoPCs', signal: new AbortController().signal }))
      .rejects.toMatchObject({ code: 'empty-track' });
  });
});
