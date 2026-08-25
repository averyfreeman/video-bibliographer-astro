import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { classifyYouTubeTranscriptError, YouTubeTranscriptError } from './errors';
import type { TranscriptProvider, TranscriptProviderRequest } from './provider';
import type { TranscriptProviderResult, TranscriptCue, TranscriptSource } from './types';

const execFileAsync = promisify(execFile);
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_METADATA_BYTES = 4 * 1024 * 1024;
const DEFAULT_CAPTION_BYTES = 8 * 1024 * 1024;
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const ALLOWED_CAPTION_HOSTS = new Set(['youtube.com', 'googlevideo.com']);

type YtDlpExecutionOptions = {
  timeout: number;
  maxBuffer: number;
  signal: AbortSignal;
};

/** Injectable command execution seam for deterministic provider tests. */
export type YtDlpExecutor = (
  args: string[],
  options: YtDlpExecutionOptions,
) => Promise<{ stdout: string; stderr: string }>;

/** Injectable caption fetch seam for deterministic provider tests. */
export type CaptionFetcher = (url: string, options?: { signal?: AbortSignal }) => Promise<Response>;

/** Options controlling the bounded yt-dlp adapter. */
export interface YtDlpTranscriptProviderOptions {
  /** Injectable yt-dlp executor. */
  execute?: YtDlpExecutor;
  /** Injectable caption fetcher. */
  fetchCaption?: CaptionFetcher;
  /** Maximum duration for each provider operation. */
  timeoutMs?: number;
  /** Maximum metadata output accepted from yt-dlp. */
  maxMetadataBytes?: number;
  /** Maximum caption response body accepted from YouTube. */
  maxCaptionBytes?: number;
}

type CaptionTrack = { url?: unknown; ext?: unknown };
type CaptionMap = Record<string, CaptionTrack[]>;
type YtDlpMetadata = {
  title?: unknown;
  subtitles?: CaptionMap;
  automatic_captions?: CaptionMap;
};

const defaultExecute: YtDlpExecutor = async (args, options) => {
  const result = await execFileAsync('yt-dlp', args, {
    signal: options.signal,
    timeout: options.timeout,
    maxBuffer: options.maxBuffer,
    encoding: 'utf8',
  });
  return { stdout: result.stdout, stderr: result.stderr };
};

const defaultFetchCaption: CaptionFetcher = (url, options) => fetch(url, options);

function isAllowedCaptionUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const allowed = ALLOWED_CAPTION_HOSTS.has(hostname)
      || hostname.endsWith('.youtube.com')
      || hostname.endsWith('.googlevideo.com');
    return url.protocol === 'https:' && allowed && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

function chooseTrack(metadata: YtDlpMetadata): { language: string; source: TranscriptSource; track: CaptionTrack } | null {
  const candidates: Array<{ source: TranscriptSource; tracks?: CaptionMap }> = [
    { source: 'manual', tracks: metadata.subtitles },
    { source: 'automatic', tracks: metadata.automatic_captions },
  ];
  for (const { source, tracks } of candidates) {
    if (!tracks) continue;
    const language = ['en', 'en-US', 'en-GB'].find((key) => tracks[key]?.length)
      ?? Object.keys(tracks).find((key) => tracks[key]?.length);
    if (language) {
      const track = tracks[language]?.find((candidate) => typeof candidate.url === 'string');
      if (track) return { language, source, track };
    }
  }
  return null;
}

async function readBoundedBody(response: Response, maxBytes: number, signal: AbortSignal): Promise<string> {
  if (!response.body) {
    const body = await response.text();
    if (new TextEncoder().encode(body).byteLength > maxBytes) {
      throw new YouTubeTranscriptError('provider', 'The caption response exceeded its safety limit.');
    }
    return body;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      if (signal.aborted) throw new YouTubeTranscriptError('timeout', 'The caption request was cancelled.');
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new YouTubeTranscriptError('provider', 'The caption response exceeded its safety limit.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function parseJson3(body: string): TranscriptCue[] {
  let payload: { events?: Array<{ tStartMs?: unknown; segs?: Array<{ utf8?: unknown }> }> };
  try {
    payload = JSON.parse(body) as typeof payload;
  } catch (error) {
    throw new YouTubeTranscriptError('provider', 'The caption response was not valid JSON.', error);
  }
  return (payload.events ?? []).flatMap((event) => {
    const text = (event.segs ?? []).map((segment) => typeof segment.utf8 === 'string' ? segment.utf8 : '')
      .join('').replace(/\s+/g, ' ').trim();
    const start = typeof event.tStartMs === 'number' ? event.tStartMs / 1000 : 0;
    return text && Number.isFinite(start) && start >= 0 ? [{ start, text }] : [];
  });
}

function createLinkedSignal(parent: AbortSignal, timeoutMs: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort(parent.reason);
  const timer = setTimeout(() => controller.abort(new DOMException('Provider timeout', 'TimeoutError')), timeoutMs);
  if (parent.aborted) abortFromParent();
  else parent.addEventListener('abort', abortFromParent, { once: true });
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      parent.removeEventListener('abort', abortFromParent);
    },
  };
}

/** A bounded yt-dlp transcript provider with injectable process and network seams. */
export class YtDlpTranscriptProvider implements TranscriptProvider {
  private readonly execute: YtDlpExecutor;
  private readonly fetchCaption: CaptionFetcher;
  private readonly timeoutMs: number;
  private readonly maxMetadataBytes: number;
  private readonly maxCaptionBytes: number;

  /**
   * Creates a provider adapter.
   * @param options Bounds and injectable dependencies.
   */
  constructor(options: YtDlpTranscriptProviderOptions = {}) {
    this.execute = options.execute ?? defaultExecute;
    this.fetchCaption = options.fetchCaption ?? defaultFetchCaption;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxMetadataBytes = options.maxMetadataBytes ?? DEFAULT_METADATA_BYTES;
    this.maxCaptionBytes = options.maxCaptionBytes ?? DEFAULT_CAPTION_BYTES;
  }

  /**
   * Retrieves captions for a validated video ID.
   * @param request Validated video ID and cancellation signal.
   * @returns Normalized timestamped cues.
   * @throws YouTubeTranscriptError when the provider cannot return honest cues.
   */
  async getTranscript({ videoId, signal }: TranscriptProviderRequest): Promise<TranscriptProviderResult> {
    if (!YOUTUBE_ID_PATTERN.test(videoId)) {
      throw new YouTubeTranscriptError('invalid-url', 'The transcript provider received an invalid video ID.');
    }
    const linked = createLinkedSignal(signal, this.timeoutMs);
    try {
      const { stdout } = await this.execute([
        '--dump-single-json',
        '--skip-download',
        '--no-playlist',
        '--no-warnings',
        '--',
        `https://www.youtube.com/watch?v=${videoId}`,
      ], {
        timeout: this.timeoutMs,
        maxBuffer: this.maxMetadataBytes,
        signal: linked.signal,
      });
      let metadata: YtDlpMetadata;
      try {
        metadata = JSON.parse(stdout) as YtDlpMetadata;
      } catch (error) {
        throw new YouTubeTranscriptError('provider', 'The transcript metadata was not valid JSON.', error);
      }
      const selected = chooseTrack(metadata);
      if (!selected) throw new YouTubeTranscriptError('captionless', 'This video has no accessible captions.');
      const captionUrl = selected.track.url;
      if (typeof captionUrl !== 'string' || !isAllowedCaptionUrl(captionUrl)) {
        throw new YouTubeTranscriptError('provider', 'The provider returned an unsafe caption URL.');
      }
      const response = await this.fetchCaption(captionUrl, { signal: linked.signal });
      if (!response.ok) {
        if (response.status === 429 || response.status === 503) {
          throw new YouTubeTranscriptError('rate-limited', `Caption request was rate-limited (HTTP ${response.status}).`);
        }
        throw new YouTubeTranscriptError('provider', `Caption request failed with HTTP ${response.status}.`);
      }
      const cues = parseJson3(await readBoundedBody(response, this.maxCaptionBytes, linked.signal));
      if (!cues.length) throw new YouTubeTranscriptError('empty-track', 'The selected caption track was empty.');
      return {
        title: typeof metadata.title === 'string' && metadata.title.trim() ? metadata.title.trim() : undefined,
        language: selected.language,
        source: selected.source,
        cues,
      };
    } catch (error) {
      throw classifyYouTubeTranscriptError(error);
    } finally {
      linked.cleanup();
    }
  }
}

/**
 * Creates a bounded yt-dlp provider.
 * @param options Bounds and injectable dependencies.
 * @returns A transcript provider.
 */
export function createYtDlpTranscriptProvider(options: YtDlpTranscriptProviderOptions = {}): TranscriptProvider {
  return new YtDlpTranscriptProvider(options);
}
