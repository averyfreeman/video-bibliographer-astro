import { describe, expect, it } from 'vitest';
import { validateBibliography } from '../src/lib/bibliography/analysis';
import type { Bibliography } from '../src/lib/bibliography/types';

const reference = (id: string, seconds: number) => ({
  id,
  timestampSeconds: seconds,
  timestamp: `00:${String(seconds).padStart(2, '0')}`,
  quote: 'A quoted phrase',
  subject: `Subject ${id}`,
  confidence: 0.8,
  sourceUrl: 'https://www.loc.gov/',
  context: 'Context',
  significance: 'Significance.',
});

describe('bibliography validation', () => {
  it('orders references by video timestamp', () => {
    const input: Bibliography = { videoUrl: 'https://youtube.com/watch?v=abc', videoTitle: 'Fixture', references: [reference('late', 20), reference('early', 2)], processingNotes: [] };
    expect(validateBibliography(input).references.map((item) => item.id)).toEqual(['early', 'late']);
  });

  it('rejects a significance synopsis longer than two paragraphs', () => {
    const input: Bibliography = { videoUrl: 'https://youtube.com/watch?v=abc', videoTitle: 'Fixture', references: [{ ...reference('bad', 1), significance: 'One.\n\nTwo.\n\nThree.' }], processingNotes: [] };
    expect(() => validateBibliography(input)).toThrow('more than two');
  });
});
