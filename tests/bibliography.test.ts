import { describe, expect, it } from 'vitest';
import { validateBibliography } from '../src/lib/bibliography/analysis';
import { bibliographySchema } from '../src/lib/bibliography/schema';
import type { Bibliography, BibliographyReference } from '../src/lib/bibliography/types';

const reference = (overrides: Partial<BibliographyReference> = {}): BibliographyReference => ({
  id: 'ref-a',
  timestampSeconds: 62,
  timestamp: '1:02',
  quote: 'A quoted phrase',
  subject: 'A subject',
  timelineLabel: 'A short timeline label',
  confidence: 0.8,
  sourceUrl: 'https://www.loc.gov/item/example/',
  context: 'Context',
  significance: 'Paragraph one.\n\nParagraph two.',
  thumbnail: {
    kind: 'source',
    url: 'https://www.loc.gov/static/images/example.jpg',
    alt: 'Archival document page related to the source',
    provenance: 'Library of Congress source page',
  },
  ...overrides,
});

const bibliography = (references: BibliographyReference[] = [reference()]): Bibliography => ({
  videoUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
  videoTitle: 'Fixture',
  references,
  processing: {
    generatedAt: '2026-08-25T10:00:00.000Z',
    transcriptSource: 'yt-dlp',
    analysisProvider: 'fixture-provider',
    model: 'fixture-model',
    notes: ['Schema-only fixture'],
  },
  processingNotes: [],
});

describe('bibliography validation', () => {
  it('orders references by video timestamp', () => {
    const ordered = validateBibliography(bibliography([
      reference({ id: 'late', timestampSeconds: 20, timestamp: '0:20', subject: 'Late' }),
      reference({ id: 'early', timestampSeconds: 2, timestamp: '0:02', subject: 'Early' }),
    ])).references.map((item) => item.id);
    expect(ordered).toEqual(['early', 'late']);
  });

  it('rejects a significance synopsis longer than two paragraphs', () => {
    const input = bibliography([reference({ id: 'bad', timestampSeconds: 1, timestamp: '0:01', significance: 'One.\n\nTwo.\n\nThree.' })]);
    expect(() => validateBibliography(input)).toThrow('two paragraphs');
  });
});

describe('strict bibliography contract', () => {
  it('rejects invalid confidence, unsafe URLs, and unknown keys', () => {
    expect(bibliographySchema.safeParse(bibliography([reference({ confidence: 1.01 })])).success).toBe(false);
    expect(bibliographySchema.safeParse(bibliography([reference({ sourceUrl: 'ftp://example.test/source' })])).success).toBe(false);
    expect(bibliographySchema.safeParse({ ...bibliography(), extra: true }).success).toBe(false);
  });

  it('requires display timestamps to match timestamp seconds exactly', () => {
    expect(() => validateBibliography(bibliography([reference({ timestamp: '1:03' })]))).toThrow('timestamp display');
  });

  it('rejects overlong timeline labels and thumbnail metadata without alt/provenance', () => {
    expect(bibliographySchema.safeParse(bibliography([reference({ timelineLabel: 'x'.repeat(97) })])).success).toBe(false);
    expect(bibliographySchema.safeParse({
      ...bibliography(),
      references: [{ ...reference(), thumbnail: { kind: 'generated', provenance: 'Prompted illustration' } }],
    }).success).toBe(false);
  });

  it('orders chronology deterministically when timestamps tie', () => {
    const ordered = validateBibliography(bibliography([
      reference({ id: 'b', timestampSeconds: 60, timestamp: '1:00', subject: 'Beta' }),
      reference({ id: 'a', timestampSeconds: 60, timestamp: '1:00', subject: 'Alpha' }),
    ])).references.map((item) => item.id);
    expect(ordered).toEqual(['a', 'b']);
  });
});
