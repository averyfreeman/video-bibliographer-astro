import { describe, expect, it } from 'vitest';
import { chunkTranscriptCues } from '../../src/lib/analysis/chunks';
import type { TranscriptCue } from '../../src/lib/youtube/types';

describe('bounded transcript chunks', () => {
  it('rejects bounds that cannot contain a timestamp and one character', () => {
    expect(() => chunkTranscriptCues([{ start: 0, text: 'abc' }], { maxCharacters: 1 })).toThrow(
      'too small for a timestamped cue',
    );
  });

  it('keeps every formatted chunk within the character bound and preserves cue timestamps', () => {
    const cues: TranscriptCue[] = [
      { start: 1.25, text: 'Alpha reference.' },
      { start: 42.5, text: 'Beta reference with enough words to force another chunk.' },
      { start: 93, text: 'Gamma reference.' },
    ];

    const chunks = chunkTranscriptCues(cues, { maxCharacters: 72 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.text.length <= 72)).toBe(true);
    expect(chunks.flatMap((chunk) => chunk.cues).map((cue) => cue.start)).toEqual([1.25, 42.5, 93]);
    expect(chunks.map((chunk) => chunk.text).join('\n')).toContain('[1.25s] Alpha reference.');
    expect(chunks.map((chunk) => chunk.text).join('\n')).toContain('[42.50s] Beta reference');
  });
});
