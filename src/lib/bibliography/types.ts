/** A historically significant reference identified in a video's transcript. */
export interface BibliographyReference {
  /** Stable identifier used for rendering and deterministic effects. */
  id: string;
  /** Start time in seconds from the video. */
  timestampSeconds: number;
  /** Human-readable timestamp such as 03:42. */
  timestamp: string;
  /** Quoted or paraphrased wording from the video. */
  quote: string;
  /** Person, event, work, or idea identified. */
  subject: string;
  /** Confidence in the identification from 0 through 1. */
  confidence: number;
  /** Original source URL, when identified. */
  sourceUrl: string;
  /** Short contextual explanation. */
  context: string;
  /** Significance synopsis, limited to two paragraphs. */
  significance: string;
  /** Whether the visual is archival, generated, or reconstructed. */
  thumbnailKind?: 'archival' | 'source' | 'generated' | 'reconstruction';
  /** Accessible description of the thumbnail. */
  thumbnailAlt?: string;
  /** Disclaimer shown when evidence remains uncertain. */
  disclaimer?: string;
}

/** The complete persisted work product for one video. */
export interface Bibliography {
  /** Input YouTube URL. */
  videoUrl: string;
  /** Display title of the source video. */
  videoTitle: string;
  /** Ordered references. */
  references: BibliographyReference[];
  /** Notes about transcript and verification processing. */
  processingNotes: string[];
}
