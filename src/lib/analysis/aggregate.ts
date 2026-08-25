import type { AnalysisChunkResult } from './types';
import type { BibliographyReference } from '../bibliography/types';

const UNCERTAINTY_THRESHOLD = 0.75;

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function isDuplicate(left: BibliographyReference, right: BibliographyReference): boolean {
  return normalize(left.subject) === normalize(right.subject)
    && normalize(left.quote) === normalize(right.quote)
    && Math.abs(left.timestampSeconds - right.timestampSeconds) <= 2;
}

function withUncertainty(candidate: BibliographyReference): BibliographyReference {
  if (candidate.confidence >= UNCERTAINTY_THRESHOLD || candidate.disclaimer?.trim()) return candidate;
  return {
    ...candidate,
    disclaimer: 'This identification is uncertain and should be independently verified against the source.',
  };
}

/**
 * Aggregates chunk results, retaining the strongest duplicate and explicit uncertainty.
 * @param results Chunk-level provider results in request order.
 * @returns Deterministically ordered, deduplicated candidates.
 */
export function aggregateAnalysisCandidates(results: AnalysisChunkResult[]): BibliographyReference[] {
  const aggregated: BibliographyReference[] = [];
  for (const result of results) {
    for (const rawCandidate of result.candidates) {
      const candidate = withUncertainty(rawCandidate);
      const duplicateIndex = aggregated.findIndex((existing) => isDuplicate(existing, candidate));
      if (duplicateIndex < 0) {
        aggregated.push(candidate);
      } else if (candidate.confidence > aggregated[duplicateIndex].confidence) {
        aggregated[duplicateIndex] = candidate;
      }
    }
  }
  return aggregated.sort((left, right) => {
    const timestampOrder = left.timestampSeconds - right.timestampSeconds;
    return timestampOrder || left.id.localeCompare(right.id);
  });
}

/** Collects provider notes without duplicate lines while preserving order. */
export function aggregateAnalysisNotes(results: AnalysisChunkResult[]): string[] {
  return [...new Set(results.flatMap((result) => result.notes).map((note) => note.trim()).filter(Boolean))];
}
