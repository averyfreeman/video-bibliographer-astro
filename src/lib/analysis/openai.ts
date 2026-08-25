import { createOpenAI } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import type { LanguageModel } from 'ai';
import type { BibliographyReference } from '../bibliography/types';
import { analysisChunkResultSchema } from './schema';
import { AnalysisError } from './errors';
import type { AnalysisChunkRequest, AnalysisChunkResult, BibliographyAnalysisProvider } from './types';

export { AnalysisError } from './errors';

const DEFAULT_MODEL = 'gpt-4o-mini';

type OpenAIEnvironment = {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_BASE_URL?: string;
};

/** Runtime-only OpenAI configuration; the key is never included in diagnostics. */
export interface OpenAIAnalysisConfig {
  /** Runtime credential consumed only by the server-side SDK adapter. */
  apiKey: string;
  /** Configured OpenAI application model, independent from the Codex model. */
  model: string;
  /** Optional OpenAI-compatible endpoint. */
  baseURL?: string;
}

/** Injectable structured generation seam used by deterministic tests. */
export type OpenAIObjectGenerator = (options: {
  model: LanguageModel;
  schema: typeof analysisChunkResultSchema;
  prompt: string;
  abortSignal?: AbortSignal;
}) => Promise<{ object: unknown; modelId?: string }>;

/** Loads OpenAI settings from the server process environment. */
export function loadOpenAIAnalysisConfig(env: OpenAIEnvironment = process.env): OpenAIAnalysisConfig {
  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new AnalysisError('missing-key', 'OpenAI analysis is not configured on the server.');
  const model = env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  if (!model) throw new AnalysisError('invalid-config', 'OpenAI analysis model configuration is invalid.');
  const baseURL = env.OPENAI_BASE_URL?.trim() || undefined;
  return { apiKey, model, ...(baseURL ? { baseURL } : {}) };
}

function buildPrompt(request: AnalysisChunkRequest): string {
  return [
    'You are a meticulous historical bibliographer.',
    'Identify every plausible historical quote, person, event, work, or idea in this transcript chunk.',
    'Return only the requested structured object. Do not invent sources; use a disclaimer when uncertain.',
    'Use integer timestampSeconds matching a cue and a matching M:SS or H:MM:SS timestamp.',
    'Keep significance to at most two paragraphs and use http(s) source URLs.',
    `VIDEO URL: ${request.videoUrl}`,
    `VIDEO TITLE: ${request.videoTitle}`,
    `CHUNK INDEX: ${request.chunk.index}`,
    `CHUNK TIME RANGE: ${request.chunk.startSeconds}-${request.chunk.endSeconds} seconds`,
    'TRANSCRIPT CHUNK:',
    request.chunk.text,
  ].join('\n');
}

async function defaultObjectGenerator(options: {
  model: LanguageModel;
  schema: typeof analysisChunkResultSchema;
  prompt: string;
  abortSignal?: AbortSignal;
}): Promise<{ object: unknown; modelId?: string }> {
  const result = await generateText({
    model: options.model,
    output: Output.object({
      schema: options.schema,
      name: 'historical_bibliography_chunk',
      description: 'Historical references found in one bounded transcript chunk.',
    }),
    prompt: options.prompt,
    abortSignal: options.abortSignal,
    maxRetries: 0,
  });
  return { object: result.output, modelId: result.finalStep.response.modelId };
}

/** A typed OpenAI structured-output provider for bibliography chunks. */
export class OpenAIBibliographyAnalysisProvider implements BibliographyAnalysisProvider {
  readonly name = 'openai';
  readonly model: string;
  private readonly generate: OpenAIObjectGenerator;
  private readonly languageModel: LanguageModel;

  /**
   * Creates a provider with a validated runtime configuration.
   * @param config OpenAI runtime configuration.
   * @param generator Injectable structured generation implementation.
   */
  constructor(config: OpenAIAnalysisConfig, generator?: OpenAIObjectGenerator) {
    this.model = config.model;
    const client = createOpenAI({
      apiKey: config.apiKey,
      ...(config.baseURL ? { baseURL: config.baseURL } : {}),
    });
    this.languageModel = client.responses(config.model);
    this.generate = generator ?? defaultObjectGenerator;
  }

  /**
   * Analyzes and validates one bounded transcript chunk.
   * @param request Video metadata and bounded timestamped chunk.
   * @returns Validated candidates and provider notes.
   * @throws AnalysisError for malformed, schema-invalid, or provider output.
   */
  async analyzeChunk(request: AnalysisChunkRequest): Promise<AnalysisChunkResult> {
    let generated: { object: unknown; modelId?: string };
    try {
      generated = await this.generate({
        model: this.languageModel,
        schema: analysisChunkResultSchema,
        prompt: buildPrompt(request),
        abortSignal: request.signal,
      });
    } catch (error) {
      if (error instanceof AnalysisError) throw error;
      throw new AnalysisError('provider', 'OpenAI analysis provider failed.', error);
    }

    if (!generated.object || typeof generated.object !== 'object' || Array.isArray(generated.object)) {
      throw new AnalysisError('malformed-output', 'OpenAI returned malformed structured output.');
    }
    const parsed = analysisChunkResultSchema.safeParse(generated.object);
    if (!parsed.success) throw new AnalysisError('schema-invalid', 'OpenAI returned schema-invalid bibliography output.', parsed.error);
    return {
      candidates: parsed.data.candidates.map((candidate: BibliographyReference) => ({
        ...candidate,
        ...(candidate.confidence < 0.75 && !candidate.disclaimer?.trim()
          ? { disclaimer: 'This identification is uncertain and should be independently verified against the source.' }
          : {}),
      })),
      notes: parsed.data.notes,
    };
  }
}

/**
 * Creates the default server-side OpenAI analysis provider.
 * @param options Optional environment and injectable generator overrides.
 * @returns A configured OpenAI bibliography provider.
 * @throws AnalysisError when the runtime key is absent or configuration is invalid.
 */
export function createOpenAIBibliographyAnalysisProvider(options: {
  config?: OpenAIAnalysisConfig;
  env?: OpenAIEnvironment;
  generateObject?: OpenAIObjectGenerator;
} = {}): OpenAIBibliographyAnalysisProvider {
  const config = options.config ?? loadOpenAIAnalysisConfig(options.env);
  return new OpenAIBibliographyAnalysisProvider(config, options.generateObject);
}
