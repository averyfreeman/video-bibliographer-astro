/** A transcript cue with its position in the source video. */
export interface TranscriptCue {
  /** Cue start in seconds. */
  start: number;
  /** Spoken text. */
  text: string;
}

/** A normalized, safe YouTube video reference. */
export interface NormalizedYouTubeUrl {
  /** The validated eleven-character YouTube video ID. */
  videoId: string;
  /** Canonical URL containing only the validated video ID. */
  canonicalUrl: string;
  /** Optional start time requested by the input URL. */
  startSeconds?: number;
}

/** The provider's manual or automatically generated caption provenance. */
export type TranscriptSource = 'manual' | 'automatic';

/** The normalized result returned by a transcript provider. */
export interface TranscriptProviderResult {
  /** Provider-reported title, when available. */
  title?: string;
  /** BCP-47-ish language key reported by the provider. */
  language?: string;
  /** Whether the selected track was manual or automatic. */
  source: TranscriptSource;
  /** Ordered, non-empty transcript cues. */
  cues: TranscriptCue[];
}

/** The transcript and metadata returned for a YouTube URL. */
export interface YouTubeTranscript extends TranscriptProviderResult {
  /** Canonical source URL. */
  videoUrl: string;
  /** Video title, with a safe fallback when the provider omits it. */
  title: string;
}
