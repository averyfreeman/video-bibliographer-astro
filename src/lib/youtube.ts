import { classifyYouTubeTranscriptError, YouTubeTranscriptError } from './youtube/errors';
import { createYtDlpTranscriptProvider } from './youtube/yt-dlp-provider';
import type { TranscriptProvider } from './youtube/provider';
import type { NormalizedYouTubeUrl, YouTubeTranscript } from './youtube/types';

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be']);

function validYouTubeId(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  return YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
}

export type { NormalizedYouTubeUrl, TranscriptCue, YouTubeTranscript } from './youtube/types';
export { YouTubeTranscriptError } from './youtube/errors';
export type { TranscriptProvider } from './youtube/provider';

function parseStartTime(value: string | null): number | undefined {
  if (!value) return undefined;
  if (/^\d+(?:\.\d+)?$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?$/i);
  if (!match || !match[0]) return undefined;
  const seconds = Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
  return Number.isFinite(seconds) ? seconds : undefined;
}

/**
 * Normalizes supported YouTube URL forms without accepting arbitrary hosts.
 * @param input User-provided URL.
 * @returns A canonical video URL and optional start time, or `null` when unsupported.
 */
export function normalizeYouTubeUrl(input: string): NormalizedYouTubeUrl | null {
  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || !YOUTUBE_HOSTS.has(hostname) || url.username || url.password || url.port) return null;

    let videoId: string | null = null;
    if (hostname === 'youtu.be') {
      const segments = url.pathname.split('/').filter(Boolean);
      videoId = segments.length === 1 ? validYouTubeId(segments[0]) : null;
    } else if (url.pathname === '/watch' || url.pathname === '/') {
      videoId = validYouTubeId(url.searchParams.get('v'));
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)$/);
      videoId = validYouTubeId(match?.[1]);
    }
    if (!videoId) return null;
    const startSeconds = parseStartTime(url.searchParams.get('start') ?? url.searchParams.get('t'));
    return {
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      ...(startSeconds === undefined ? {} : { startSeconds }),
    };
  } catch {
    return null;
  }
}

/**
 * Extracts a YouTube video ID from common watch, short, and embed URLs.
 * @param input User-provided URL.
 * @returns The video ID, or `null` for a non-YouTube URL.
 */
export function extractYouTubeId(input: string): string | null {
  return normalizeYouTubeUrl(input)?.videoId ?? null;
}

/**
 * Retrieves timestamped captions through an injectable, bounded provider.
 * @param videoUrl Public YouTube URL.
 * @param options Provider and timeout overrides for server-side execution.
 * @returns Transcript cues and title.
 * @throws YouTubeTranscriptError when the URL or provider cannot return honest cues.
 */
export async function fetchYouTubeTranscript(
  videoUrl: string,
  options: { provider?: TranscriptProvider; timeoutMs?: number } = {},
): Promise<YouTubeTranscript> {
  const normalized = normalizeYouTubeUrl(videoUrl);
  if (!normalized) throw new YouTubeTranscriptError('invalid-url', 'Please provide a valid public YouTube video URL.');
  const provider = options.provider ?? createYtDlpTranscriptProvider({ timeoutMs: options.timeoutMs });
  const controller = new AbortController();
  const timeout = options.timeoutMs ?? 20_000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new YouTubeTranscriptError('timeout', 'The transcript provider timed out.'));
    }, timeout);
  });
  try {
    const result = await Promise.race([
      provider.getTranscript({ videoId: normalized.videoId, signal: controller.signal }),
      timeoutPromise,
    ]);
    if (!result.cues.length) throw new YouTubeTranscriptError('empty-track', 'The transcript track was empty.');
    return {
      videoUrl: normalized.canonicalUrl,
      title: result.title?.trim() || `YouTube video ${normalized.videoId}`,
      language: result.language,
      source: result.source,
      cues: result.cues,
    };
  } catch (error) {
    throw classifyYouTubeTranscriptError(error);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
