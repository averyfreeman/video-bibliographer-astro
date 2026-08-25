import type { Bibliography, BibliographyReference } from './types';

/**
 * Creates a compact, ordered timeline model for display and Markdown output.
 * @param references Candidate references from an analysis run.
 * @returns References ordered by their spoken timestamp.
 */
export function orderReferences(references: BibliographyReference[]): BibliographyReference[] {
  return [...references].sort((left, right) => left.timestampSeconds - right.timestampSeconds);
}

/**
 * Validates the presentation-level constraints that the AI schema cannot express.
 * @param bibliography Candidate work product.
 * @returns The same bibliography with references ordered chronologically.
 * @throws Error when a synopsis exceeds two paragraphs or a timeline label is too long.
 */
export function validateBibliography(bibliography: Bibliography): Bibliography {
  const references = orderReferences(bibliography.references).map((reference) => {
    const paragraphCount = reference.significance.trim().split(/\n\s*\n/).filter(Boolean).length;
    if (paragraphCount > 2) throw new Error(`Reference ${reference.id} has more than two synopsis paragraphs`);
    if (reference.subject.length > 96) throw new Error(`Reference ${reference.id} subject is longer than 96 characters`);
    return reference;
  });
  return { ...bibliography, references };
}
