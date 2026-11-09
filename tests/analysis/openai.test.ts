import { describe, expect, it } from 'vitest';
import {
  AnalysisError,
  createOpenAIBibliographyAnalysisProvider,
} from '../../src/lib/analysis/openai';
import type { AnalysisChunkRequest } from '../../src/lib/analysis/types';

const request: AnalysisChunkRequest = {
  videoUrl: 'https://www.youtube.com/watch?v=t38LbMVoPCs',
  videoTitle: 'Fixture video',
  chunk: {
    index: 0,
    startSeconds: 12,
    endSeconds: 12,
    text: '[12.00s] A quote from the fixture.',
    cues: [{ start: 12, text: 'A quote from the fixture.' }],
  },
};

const candidate = (overrides: Record<string, unknown> = {}) => ({
  id: 'candidate-1',
  timestampSeconds: 12,
  timestamp: '0:12',
  quote: 'A quote from the fixture.',
  subject: 'A historical subject',
  confidence: 0.4,
  sourceUrl: 'https://www.loc.gov/item/example/',
  context: 'The transcript references the subject.',
  significance: 'The subject matters historically.',
  ...overrides,
});

describe('OpenAI bibliography analysis provider', () => {
  it('validates structured output and preserves uncertainty for low confidence candidates', async () => {
    const provider = createOpenAIBibliographyAnalysisProvider({
      config: { apiKey: 'test-secret', model: 'fixture-model' },
      generateObject: async () => ({ object: { candidates: [candidate()], notes: ['Fixture uncertainty'] } }),
    });

    const result = await provider.analyzeChunk(request);

    expect(result.candidates[0]?.disclaimer).toContain('uncertain');
    expect(result.candidates[0]?.sourceVerification).toBe('unverified');
    expect(result.notes).toEqual(['Fixture uncertainty']);
    expect(provider.model).toBe('fixture-model');
  });

  it('classifies malformed and schema-invalid model output without exposing raw output', async () => {
    const malformed = createOpenAIBibliographyAnalysisProvider({
      config: { apiKey: 'test-secret', model: 'fixture-model' },
      generateObject: async () => ({ object: 'not an object' }),
    });
    await expect(malformed.analyzeChunk(request)).rejects.toMatchObject({ code: 'malformed-output' });

    const invalid = createOpenAIBibliographyAnalysisProvider({
      config: { apiKey: 'test-secret', model: 'fixture-model' },
      generateObject: async () => ({ object: { candidates: [candidate({ confidence: 2 })], notes: [] } }),
    });
    await expect(invalid.analyzeChunk(request)).rejects.toMatchObject({ code: 'schema-invalid' });
  });

  it('classifies provider failures and does not include a secret from the cause', async () => {
    const provider = createOpenAIBibliographyAnalysisProvider({
      config: { apiKey: 'test-secret', model: 'fixture-model' },
      generateObject: async () => {
        throw new Error('HTTP 401 with test-secret');
      },
    });

    const error = await provider.analyzeChunk(request).catch((value: unknown) => value) as AnalysisError;
    expect(error).toMatchObject({ code: 'provider' });
    expect(error.message).not.toContain('test-secret');
  });

  it('rejects missing runtime credentials without printing the key or model configuration', () => {
    expect(() => createOpenAIBibliographyAnalysisProvider({
      env: { OPENAI_MODEL: 'fixture-model' },
    })).toThrowError(AnalysisError);
    try {
      createOpenAIBibliographyAnalysisProvider({ env: { OPENAI_MODEL: 'fixture-model' } });
    } catch (error) {
      expect(error).toMatchObject({ code: 'missing-key' });
      expect(String(error)).not.toContain('fixture-model');
    }
  });
});
