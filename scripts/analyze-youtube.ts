import { resolve } from 'node:path';
import { fetchYouTubeTranscript } from '../src/lib/youtube';
import { YouTubeTranscriptError } from '../src/lib/youtube/errors';
import { renderBibliographyMarkdown, workProductName } from '../src/lib/bibliography/markdown';
import { persistBibliographyMarkdown } from '../src/lib/bibliography/storage';
import { validateBibliography } from '../src/lib/bibliography/analysis';
import { aggregateAnalysisCandidates, aggregateAnalysisNotes } from '../src/lib/analysis/aggregate';
import { chunkTranscriptCues } from '../src/lib/analysis/chunks';
import { createOpenAIBibliographyAnalysisProvider } from '../src/lib/analysis/openai';
import type { OpenAIEnvironment } from '../src/lib/analysis/openai';
import type { MarkdownBibliography } from '../src/lib/bibliography/types';
import type { BibliographyAnalysisProvider } from '../src/lib/analysis/types';
import type { TranscriptProvider } from '../src/lib/youtube/provider';

/** Options for deterministic or server-configured bibliography analysis. */
export interface AnalyzeYouTubeOptions {
  /** Injectable transcript provider for fixtures and provider substitution. */
  transcriptProvider?: TranscriptProvider;
  /** Injectable analysis provider; defaults to the runtime-configured OpenAI adapter. */
  analysisProvider?: BibliographyAnalysisProvider;
  /** Transcript acquisition timeout in milliseconds. */
  timeoutMs?: number;
  /** Bounded transcript chunk settings. */
  chunkOptions?: { maxCharacters?: number };
  /** Root directory for retained Markdown work products. */
  outputRoot?: string;
  /** Clock override for deterministic output names and metadata. */
  now?: Date;
  /** Server-only OpenAI environment override. */
  analysisEnv?: OpenAIEnvironment;
}

/**
 * Runs the end-to-end YouTube transcript to Markdown work-product workflow.
 * @param videoUrl Public YouTube URL.
 * @param options Injectable providers, bounds, clock, and output location.
 * @returns Absolute path to the saved Markdown file.
 * @throws Error when credentials, transcript access, model output, or persistence fails.
 */
/** Result returned by the server/CLI workflow after persistence. */
export interface AnalyzeYouTubeResult {
  /** Absolute path to the saved Markdown work product. */
  outputFile: string;
  /** Validated bibliography returned by the analysis pipeline. */
  bibliography: MarkdownBibliography;
}

/**
 * Runs the complete transcript-to-bibliography workflow and returns its validated result.
 * @param videoUrl Public YouTube URL.
 * @param options Injectable providers, bounds, clock, and output location.
 * @returns Validated bibliography and absolute persisted Markdown path.
 * @throws Error when credentials, transcript access, model output, or persistence fails.
 */
export async function analyzeYouTubeDetailed(videoUrl: string, options: AnalyzeYouTubeOptions = {}): Promise<AnalyzeYouTubeResult> {
  const transcript = await fetchYouTubeTranscript(videoUrl, {
    provider: options.transcriptProvider,
    timeoutMs: options.timeoutMs,
  });
  const chunks = chunkTranscriptCues(transcript.cues, options.chunkOptions);
  const analysisProvider = options.analysisProvider ?? createOpenAIBibliographyAnalysisProvider({ env: options.analysisEnv });
  const results = [];
  for (const chunk of chunks) {
    results.push(await analysisProvider.analyzeChunk({
      videoUrl: transcript.videoUrl,
      videoTitle: transcript.title,
      chunk,
    }));
  }
  const notes = [
    `Processed ${chunks.length} bounded transcript chunk${chunks.length === 1 ? '' : 's'}.`,
    ...aggregateAnalysisNotes(results),
  ];
  const now = options.now ?? new Date();
  const bibliography = validateBibliography({
    videoUrl: transcript.videoUrl,
    videoTitle: transcript.title,
    references: aggregateAnalysisCandidates(results),
    processing: {
      generatedAt: now.toISOString(),
      transcriptSource: `${transcript.source}${transcript.language ? ` (${transcript.language})` : ''}`,
      analysisProvider: analysisProvider.name,
      ...(analysisProvider.model ? { model: analysisProvider.model } : {}),
      notes,
    },
    processingNotes: notes,
  });
  const markdown = renderBibliographyMarkdown(bibliography);
  const folder = workProductName(transcript.title, now);
  const root = resolve(options.outputRoot ?? process.env.BIBLIOGRAPHY_OUTPUT_ROOT ?? './bibliographies');
  const outputFile = await persistBibliographyMarkdown({ root, folderName: folder, markdown });
  return { outputFile, bibliography };
}

/**
 * Runs the complete transcript-to-bibliography workflow.
 * @param videoUrl Public YouTube URL.
 * @param options Injectable providers, bounds, clock, and output location.
 * @returns Absolute path to the saved Markdown file.
 * @throws Error when credentials, transcript access, model output, or persistence fails.
 */
export async function analyzeYouTube(videoUrl: string, options: AnalyzeYouTubeOptions = {}): Promise<string> {
  const result = await analyzeYouTubeDetailed(videoUrl, options);
  return result.outputFile;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const videoUrl = process.argv[2];
  if (!videoUrl) {
    console.error('Usage: pnpm analyze:youtube <youtube-url>');
    process.exitCode = 2;
  } else {
    analyzeYouTube(videoUrl)
      .then((outputFile) => console.log(`Work product saved: ${outputFile}`))
      .catch((error: unknown) => {
        if (error instanceof YouTubeTranscriptError) {
          console.error(`[${error.code}] ${error.message}`);
        } else {
          console.error(error instanceof Error ? error.message : 'Analysis failed.');
        }
        process.exitCode = 1;
      });
  }
}

export default analyzeYouTube;
