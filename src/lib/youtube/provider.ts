import type { TranscriptProviderResult } from './types';

/** Input passed to an injectable transcript provider. */
export interface TranscriptProviderRequest {
  /** Validated eleven-character YouTube video ID, never an arbitrary URL. */
  videoId: string;
  /** Signal that providers must honor for cancellation and timeout bounds. */
  signal: AbortSignal;
}

/** Injectable server-side transcript provider contract. */
export interface TranscriptProvider {
  /**
   * Retrieves and normalizes timestamped cues for a validated video ID.
   * @param request Validated ID and cancellation signal.
   * @returns Provider result with timestamped cues.
   */
  getTranscript(request: TranscriptProviderRequest): Promise<TranscriptProviderResult>;
}
