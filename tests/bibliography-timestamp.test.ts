import { describe, expect, it } from 'vitest';
import { bibliographyReferenceSchema } from '../src/lib/bibliography/schema';

describe('bibliography timestamps', () => {
  it('accepts short hour displays such as 1:02', () => {
    const result = bibliographyReferenceSchema.safeParse({
      id: 'one', timestampSeconds: 62, timestamp: '1:02', quote: 'A quote', subject: 'A subject',
      confidence: 0.8, sourceUrl: 'https://www.loc.gov/', context: 'Context', significance: 'Significance',
    });
    expect(result.success).toBe(true);
  });
});
