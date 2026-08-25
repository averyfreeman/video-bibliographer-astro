/** Classification for thumbnail evidence and illustrative image provenance. */
export type ThumbnailKind = 'archival' | 'source' | 'generated' | 'reconstruction';

/** Metadata required to render and audit a citation thumbnail. */
export interface BibliographyThumbnail {
  /** Whether the thumbnail is source evidence or an illustrative reconstruction. */
  kind: ThumbnailKind;
  /** Optional local or remote image URL retained with the Markdown work product. */
  url?: string;
  /** Accessible alternative text that describes the thumbnail content. */
  alt: string;
  /** Human-readable provenance such as archive name, source page, provider, or prompt note. */
  provenance: string;
}

/** Processing metadata retained with a bibliography work product. */
export interface BibliographyProcessingMetadata {
  /** ISO-8601 instant when the bibliography was generated. */
  generatedAt: string;
  /** Transcript acquisition method or fixture identifier. */
  transcriptSource: string;
  /** Analysis provider or deterministic fixture that produced the references. */
  analysisProvider: string;
  /** Optional model identifier used by the analysis provider. */
  model?: string;
  /** Audit notes about transcript retrieval, validation, and uncertainty handling. */
  notes: string[];
}

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
  /** Short D2/Markdown timeline label, limited to 96 characters. */
  timelineLabel?: string;
  /** Confidence in the identification from 0 through 1. */
  confidence: number;
  /** Original source URL, when identified. */
  sourceUrl: string;
  /** Short contextual explanation. */
  context: string;
  /** Significance synopsis, limited to two paragraphs. */
  significance: string;
  /** Auditable thumbnail metadata used by Markdown and browser renderers. */
  thumbnail?: BibliographyThumbnail;
  /** @deprecated Use `thumbnail.kind` instead. */
  thumbnailKind?: ThumbnailKind;
  /** @deprecated Use `thumbnail.alt` instead. */
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
  /** Structured transcript, provider, model, and validation metadata. */
  processing?: BibliographyProcessingMetadata;
  /** Notes about transcript and verification processing. */
  processingNotes: string[];
}

/** Markdown-facing citation shape after validation and chronology normalization. */
export interface MarkdownBibliographyReference extends BibliographyReference {
  /** Label guaranteed safe for timeline display. */
  timelineLabel: string;
}

/** Markdown-facing bibliography shape after validation and chronology normalization. */
export interface MarkdownBibliography extends Bibliography {
  /** References ordered by timestamp, then stable identifier. */
  references: MarkdownBibliographyReference[];
  /** Structured processing metadata guaranteed for Markdown rendering. */
  processing: BibliographyProcessingMetadata;
}
