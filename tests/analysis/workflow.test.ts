import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { analyzeYouTube } from '../../scripts/analyze-youtube';
import type { BibliographyReference } from '../../src/lib/bibliography/types';
import type { BibliographyAnalysisProvider } from '../../src/lib/analysis/types';
import type { TranscriptProvider } from '../../src/lib/youtube/provider';

const outputRoots: string[] = [];

afterEach(async () => {
  await Promise.all(outputRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const reference = (id: string, timestampSeconds: number): BibliographyReference => ({
  id,
  timestampSeconds,
  timestamp: `0:${String(timestampSeconds).padStart(2, '0')}`,
  quote: 'A repeated historical quote.',
  subject: 'A repeated historical subject',
  confidence: 0.82,
  sourceUrl: 'https://www.loc.gov/item/example/',
  context: 'The speaker refers to the subject.',
  significance: 'The source has historical significance.',
});

describe('transcript-to-bibliography workflow', () => {
  it('bounds chunks, deduplicates overlapping provider candidates, and saves exact Markdown', async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), 'video-bibliographer-'));
    outputRoots.push(outputRoot);
    const requests: string[] = [];
    const transcriptProvider: TranscriptProvider = {
      getTranscript: async () => ({
        title: 'Fixture workflow video',
        language: 'en',
        source: 'manual',
        cues: [
          { start: 1, text: 'First cue that forces a bounded chunk.' },
          { start: 9, text: 'Second cue that forces another bounded chunk.' },
        ],
      }),
    };
    const analysisProvider: BibliographyAnalysisProvider = {
      name: 'fixture-analysis',
      model: 'fixture-model',
      analyzeChunk: async ({ chunk }) => {
        requests.push(chunk.text);
        return { candidates: [reference('duplicate', 9)], notes: ['Fixture provider used.'] };
      },
    };

    const outputFile = await analyzeYouTube('https://youtu.be/t38LbMVoPCs', {
      transcriptProvider,
      analysisProvider,
      outputRoot,
      chunkOptions: { maxCharacters: 64 },
      now: new Date('2026-08-25T12:34:56.000Z'),
    });
    const markdown = await readFile(outputFile, 'utf8');

    expect(requests.length).toBeGreaterThan(1);
    expect(requests.every((text) => text.length <= 64)).toBe(true);
    expect(markdown).toContain('# Fixture workflow video');
    expect(markdown.match(/^## 0:09 —/gm)).toHaveLength(1);
    expect(markdown).toContain('- Fixture provider used.');
    expect(markdown).toBe(await readFile(outputFile, 'utf8'));
  });
});
