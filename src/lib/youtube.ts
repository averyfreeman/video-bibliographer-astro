import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** A transcript cue with its position in the source video. */
export interface TranscriptCue {
  /** Cue start in seconds. */
  start: number;
  /** Spoken text. */
  text: string;
}

/** The transcript and metadata returned for a YouTube URL. */
export interface YouTubeTranscript {
  /** Canonical source URL. */
  videoUrl: string;
  /** Video title reported by yt-dlp. */
  title: string;
  /** Ordered transcript cues. */
  cues: TranscriptCue[];
}

/**
 * Extracts a YouTube video ID from common watch, short, and embed URLs.
 * @param input User-provided URL.
 * @returns The video ID, or `null` for a non-YouTube URL.
 */
export function extractYouTubeId(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
    if (url.hostname.endsWith('youtube.com')) return url.searchParams.get('v') ?? url.pathname.match(/\/embed\/([^/]+)/)?.[1] ?? null;
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves captions using the locally installed yt-dlp executable.
 * @param videoUrl Public YouTube URL.
 * @returns Transcript cues and title.
 * @throws Error when the URL is invalid or no captions are available.
 */
export async function fetchYouTubeTranscript(videoUrl: string): Promise<YouTubeTranscript> {
  const id = extractYouTubeId(videoUrl);
  if (!id) throw new Error('Please provide a valid YouTube video URL.');
  const url = `https://www.youtube.com/watch?v=${id}`;
  const { stdout: metadata } = await execFileAsync('yt-dlp', ['--dump-single-json', '--skip-download', '--no-warnings', url], { maxBuffer: 10 * 1024 * 1024 });
  const info = JSON.parse(metadata) as { title?: string; subtitles?: Record<string, Array<{ url: string; ext?: string }>>; automatic_captions?: Record<string, Array<{ url: string; ext?: string }>> };
  const tracks = info.subtitles?.en ?? info.automatic_captions?.en ?? info.subtitles?.['en-US'] ?? info.automatic_captions?.['en-US'];
  if (!tracks?.length) throw new Error('This video has no accessible English captions. Transcript API integration is required for other cases.');
  const track = tracks.find((item) => item.ext === 'json3') ?? tracks[0];
  const response = await fetch(track.url);
  if (!response.ok) throw new Error(`Caption request failed with HTTP ${response.status}.`);
  const payload = await response.json() as { events?: Array<{ tStartMs?: number; segs?: Array<{ utf8?: string }> }> };
  const cues = (payload.events ?? []).flatMap((event) => {
    const text = (event.segs ?? []).map((segment) => segment.utf8 ?? '').join('').replace(/\s+/g, ' ').trim();
    return text ? [{ start: (event.tStartMs ?? 0) / 1000, text }] : [];
  });
  if (!cues.length) throw new Error('Caption track was empty.');
  return { videoUrl: url, title: info.title ?? `YouTube video ${id}`, cues };
}
