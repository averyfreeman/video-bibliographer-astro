import type { BibliographyReference } from '../bibliography/types';
import type { TranscriptCue } from '../youtube/types';

/** A deterministic, timestamp-preserving transcript chunk sent to an analysis provider. */
export interface TranscriptChunk {
  /** Zero-based chunk position. */
  index: number;
  /** Cues included in this chunk, in source order. */
  cues: TranscriptCue[];
  /** Formatted prompt text, bounded by the configured character limit. */
  text: string;
  /** Start time of the first cue in seconds. */
  startSeconds: number;
  /** Start time of the last cue in seconds. */
  endSeconds: number;
}

/** Input supplied to one provider analysis call. */
export interface AnalysisChunkRequest {
  /** Canonical YouTube video URL. */
  videoUrl: string;
  /** Provider-reported video title. */
  videoTitle: string;
  /** Bounded transcript chunk. */
  chunk: TranscriptChunk;
  /** Optional cancellation signal for the provider request. */
  signal?: AbortSignal;
}

/** Structured candidates and notes returned for one transcript chunk. */
export interface AnalysisChunkResult {
  /** Candidate references identified in this chunk. */
  candidates: BibliographyReference[];
  /** Provider or validation notes retained in the work product. */
  notes: string[];
}

/** Provider-neutral boundary for chunk-level bibliography extraction. */
export interface BibliographyAnalysisProvider {
  /** Stable provider label retained in processing metadata. */
  readonly name: string;
  /** Optional application model identifier retained in processing metadata. */
  readonly model?: string;
  /** Analyze one bounded chunk without acquiring arbitrary external URLs. */
  analyzeChunk(request: AnalysisChunkRequest): Promise<AnalysisChunkResult>;
}
