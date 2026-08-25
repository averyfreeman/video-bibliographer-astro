import type { APIRoute } from 'astro';
import type { AnalyzeYouTubeResult } from '../../../scripts/analyze-youtube';
import { analyzeYouTubeDetailed } from '../../../scripts/analyze-youtube';
import { AnalysisError } from '../../../src/lib/analysis/errors';
import { loadOpenAIAnalysisConfig } from '../../../src/lib/analysis/openai';
import { normalizeYouTubeUrl } from '../../../src/lib/youtube';
import { YouTubeTranscriptError } from '../../../src/lib/youtube/errors';

interface AnalyzeRequestBody {
  url?: unknown;
}

interface AnalyzeErrorResponse {
  status: 'error';
  code: string;
  message: string;
  retryable: boolean;
}

interface AnalyzeSuccessResponse {
  status: 'complete';
  title: string;
  references: AnalyzeYouTubeResult['bibliography']['references'];
  markdown: {
    identifier: string;
    path: string;
  };
}

interface AnalyzeDependencies {
  analyze?: (url: string) => Promise<AnalyzeYouTubeResult>;
  env?: NodeJS.ProcessEnv;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function safeMarkdownMetadata(outputFile: string): AnalyzeSuccessResponse['markdown'] {
  const filename = outputFile.split(/[\\/]/).filter(Boolean).at(-1) ?? 'work-product.md';
  const identifier = filename.endsWith('.md') ? filename.slice(0, -3) : filename;
  return { identifier, path: `${identifier}/${filename}` };
}

function errorResponse(error: unknown): Response {
  let payload: AnalyzeErrorResponse;
  let statusCode = 500;
  if (error instanceof YouTubeTranscriptError || error instanceof AnalysisError) {
    payload = { status: 'error', code: error.code, message: error.message, retryable: error.retryable };
    statusCode = error.code === 'invalid-url' ? 400 : error.code === 'missing-key' ? 503 : 502;
  } else {
    payload = { status: 'error', code: 'workflow', message: 'The video could not be processed.', retryable: false };
  }
  return Response.json(payload satisfies AnalyzeErrorResponse, { status: statusCode });
}

/**
 * Processes one submitted YouTube URL through the real server-side workflow.
 * @param request HTTP request containing a JSON object with a YouTube URL.
 * @param dependencies Injectable workflow and environment seams for tests.
 * @returns JSON containing validated references or a safe classified error.
 */
export async function handleAnalyzeRequest(request: Request, dependencies: AnalyzeDependencies = {}): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ status: 'error', code: 'invalid-request', message: 'Request body must be valid JSON.', retryable: false }, { status: 400 });
  }

  const url = isRecord(body) && typeof (body as AnalyzeRequestBody).url === 'string'
    ? (body as { url: string }).url.trim()
    : '';
  if (!url) {
    return Response.json({ status: 'error', code: 'invalid-url', message: 'Provide a public YouTube video URL.', retryable: false }, { status: 400 });
  }
  if (!normalizeYouTubeUrl(url)) {
    return Response.json({ status: 'error', code: 'invalid-url', message: 'Provide a public YouTube video URL.', retryable: false }, { status: 400 });
  }

  const environment = dependencies.env ?? process.env;
  if (!dependencies.analyze) {
    try {
      loadOpenAIAnalysisConfig(environment);
    } catch (error: unknown) {
      return errorResponse(error);
    }
  }

  try {
    const result = await (dependencies.analyze ?? analyzeYouTubeDetailed)(url);
    const response: AnalyzeSuccessResponse = {
      status: 'complete',
      title: result.bibliography.videoTitle,
      references: result.bibliography.references,
      markdown: safeMarkdownMetadata(result.outputFile),
    };
    return Response.json(response, { status: 200 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

/** Astro API route for the landing-page analysis form. */
export const POST: APIRoute = async ({ request }): Promise<Response> => handleAnalyzeRequest(request);

export const prerender = false;
