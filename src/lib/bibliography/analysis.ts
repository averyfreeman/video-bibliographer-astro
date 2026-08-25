import { bibliographySchema } from './schema';
import type { Bibliography, BibliographyProcessingMetadata, BibliographyReference, MarkdownBibliography, MarkdownBibliographyReference } from './types';

function formatTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function defaultProcessing(notes: string[]): BibliographyProcessingMetadata {
  return {
    generatedAt: new Date(0).toISOString(),
    transcriptSource: 'unspecified',
    analysisProvider: 'unspecified',
    notes,
  };
}

/**
 * Creates a compact, ordered timeline model for display and Markdown output.
 * @param references Candidate references from an analysis run.
 * @returns References ordered by their spoken timestamp.
 */
export function orderReferences(references: BibliographyReference[]): BibliographyReference[] {
  return [...references].sort((left, right) => {
    const byTimestamp = left.timestampSeconds - right.timestampSeconds;
    if (byTimestamp !== 0) return byTimestamp;
    return left.id.localeCompare(right.id);
  });
}

/**
 * Validates the presentation-level constraints that the AI schema cannot express.
 * @param bibliography Candidate work product.
 * @returns The same bibliography with references ordered chronologically.
 * @throws Error when a synopsis exceeds two paragraphs or a timeline label is too long.
 */
export function validateBibliography(bibliography: Bibliography): MarkdownBibliography {
  const parsed = bibliographySchema.parse(bibliography);
  const references = orderReferences(parsed.references).map((reference): MarkdownBibliographyReference => {
    const expectedTimestamp = formatTimestamp(reference.timestampSeconds);
    if (reference.timestamp !== expectedTimestamp) {
      throw new Error(`Reference ${reference.id} timestamp display must be ${expectedTimestamp}`);
    }
    const paragraphCount = reference.significance.trim().split(/\n\s*\n/).filter(Boolean).length;
    if (paragraphCount > 2) throw new Error(`Reference ${reference.id} has more than two synopsis paragraphs`);
    const timelineLabel = reference.timelineLabel ?? reference.subject;
    if (timelineLabel.length > 96) throw new Error(`Reference ${reference.id} timeline label is longer than 96 characters`);
    return { ...reference, timelineLabel };
  });
  return {
    ...parsed,
    references,
    processing: parsed.processing ?? defaultProcessing(parsed.processingNotes),
    processingNotes: parsed.processing?.notes ?? parsed.processingNotes,
  };
}
