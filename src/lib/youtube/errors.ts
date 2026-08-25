/** Stable failure categories for transcript acquisition. */
export type YouTubeTranscriptErrorCode =
  | 'invalid-url'
  | 'unsupported'
  | 'private'
  | 'captionless'
  | 'rate-limited'
  | 'timeout'
  | 'empty-track'
  | 'provider';

/** A classified, user-safe transcript acquisition failure. */
export class YouTubeTranscriptError extends Error {
  /** Stable machine-readable failure category. */
  readonly code: YouTubeTranscriptErrorCode;
  /** Whether retrying may succeed without changing the input. */
  readonly retryable: boolean;

  /**
   * Creates a classified transcript error.
   * @param code Stable failure category.
   * @param message User-safe diagnostic message.
   * @param cause Optional underlying error retained for server-side debugging.
   */
  constructor(code: YouTubeTranscriptErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'YouTubeTranscriptError';
    this.code = code;
    this.retryable = code === 'rate-limited' || code === 'timeout' || code === 'provider';
  }
}

/**
 * Converts an unknown provider failure into the stable transcript taxonomy.
 * @param error Unknown thrown value.
 * @returns A classified transcript error.
 */
export function classifyYouTubeTranscriptError(error: unknown): YouTubeTranscriptError {
  if (error instanceof YouTubeTranscriptError) return error;

  const candidate = error as { code?: unknown; name?: unknown; message?: unknown; stderr?: unknown } | null;
  const message = typeof candidate?.message === 'string' ? candidate.message : 'Transcript provider failed.';
  const stderr = typeof candidate?.stderr === 'string' ? candidate.stderr : '';
  const normalized = `${message}\n${stderr}`.toLowerCase();
  if (candidate?.code === 'ETIMEDOUT' || candidate?.name === 'AbortError' || /timed? ?out|aborted|deadline/.test(normalized)) {
    return new YouTubeTranscriptError('timeout', 'The transcript provider timed out.', error);
  }
  if (/429|too many requests|rate.?limit/.test(normalized)) {
    return new YouTubeTranscriptError('rate-limited', 'The transcript provider is rate-limiting requests.', error);
  }
  if (/private|members?-only|sign in|login required|age.?restricted/.test(normalized)) {
    return new YouTubeTranscriptError('private', 'The video is private or requires account access.', error);
  }
  if (/no (?:available )?(?:subtitles|captions)|caption.*not available|subtitle.*not available/.test(normalized)) {
    return new YouTubeTranscriptError('captionless', 'This video has no accessible captions.', error);
  }
  if (/unsupported|video unavailable|does not exist|removed|not a valid url/.test(normalized)) {
    return new YouTubeTranscriptError('unsupported', 'This YouTube video is unsupported or unavailable.', error);
  }
  return new YouTubeTranscriptError('provider', 'The transcript provider failed.', error);
}
