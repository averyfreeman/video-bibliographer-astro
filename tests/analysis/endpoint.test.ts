import { describe, expect, it, vi } from 'vitest';
import { AnalysisError } from '../../src/lib/analysis/errors';
import { BibliographyStorageError } from '../../src/lib/bibliography/storage';
import { handleAnalyzeRequest } from '../../src/pages/api/analyze';
import type { AnalyzeYouTubeResult } from '../../scripts/analyze-youtube';

const request = (body: unknown, headers: Record<string, string> = { 'content-type': 'application/json' }) =>
  new Request('http://localhost/api/analyze', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const completedResult: AnalyzeYouTubeResult = {
  outputFile: '/private/server/bibliographies/2026-08-25_12_34_56_Fixture_video/2026-08-25_12_34_56_Fixture_video.md',
  bibliography: {
    videoUrl: 'https://www.youtube.com/watch?v=t38LbMVoPCs',
    videoTitle: 'Fixture video',
    references: [],
    processing: {
      generatedAt: '2026-08-25T12:34:56.000Z',
      transcriptSource: 'fixture',
      analysisProvider: 'fixture',
      notes: ['Fixture provider used.'],
    },
    processingNotes: ['Fixture provider used.'],
  },
};

describe('POST /api/analyze', () => {
  it('rejects malformed JSON without invoking the workflow', async () => {
    const analyze = vi.fn();

    const response = await handleAnalyzeRequest(request('{not-json}'), { analyze });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ status: 'error', code: 'invalid-request' });
    expect(analyze).not.toHaveBeenCalled();
  });

  it('rejects non-YouTube URLs before invoking the workflow', async () => {
    const analyze = vi.fn();

    const response = await handleAnalyzeRequest(request({ url: 'https://example.com/video' }), { analyze });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ status: 'error', code: 'invalid-url' });
    expect(analyze).not.toHaveBeenCalled();
  });

  it('reports a missing runtime key without contacting transcript providers', async () => {
    const analyze = vi.fn();

    const response = await handleAnalyzeRequest(request({ url: 'https://youtu.be/t38LbMVoPCs' }), {
      env: {},
      analyze: undefined,
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ status: 'error', code: 'missing-key' });
    expect(analyze).not.toHaveBeenCalled();
  });

  it('returns safe result metadata from an injected workflow', async () => {
    const analyze = vi.fn(async () => completedResult);

    const response = await handleAnalyzeRequest(
      request({ url: 'https://www.youtube.com/watch?v=t38LbMVoPCs&t=12s' }),
      { analyze },
    );

    expect(response.status).toBe(200);
    const payload = await response.clone().json();
    expect(payload).toEqual({
      status: 'complete',
      title: 'Fixture video',
      references: [],
      markdown: {
        identifier: '2026-08-25_12_34_56_Fixture_video',
        path: '2026-08-25_12_34_56_Fixture_video/2026-08-25_12_34_56_Fixture_video.md',
      },
    });
    expect(analyze).toHaveBeenCalledWith('https://www.youtube.com/watch?v=t38LbMVoPCs&t=12s');
    expect(JSON.stringify(payload)).not.toContain('/private/server');
  });

  it('classifies provider failures without exposing their causes', async () => {
    const response = await handleAnalyzeRequest(request({ url: 'https://youtu.be/t38LbMVoPCs' }), {
      analyze: async () => {
        throw new AnalysisError('provider', 'OpenAI analysis provider failed.', new Error('test-secret'));
      },
    });

    const payload = await response.json();
    expect(response.status).toBe(502);
    expect(payload).toMatchObject({ status: 'error', code: 'provider' });
    expect(JSON.stringify(payload)).not.toContain('test-secret');
  });

  it('returns a conflict when exclusive work-product persistence finds an existing output', async () => {
    const response = await handleAnalyzeRequest(request({ url: 'https://youtu.be/t38LbMVoPCs' }), {
      analyze: async () => {
        throw new BibliographyStorageError('output-exists', 'A work product with this generated name already exists; no existing Markdown was overwritten.');
      },
    });

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ status: 'error', code: 'output-exists', retryable: false });
  });
});
