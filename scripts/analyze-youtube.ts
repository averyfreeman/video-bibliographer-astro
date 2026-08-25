import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fetchYouTubeTranscript } from '../src/lib/youtube';
import { YouTubeTranscriptError } from '../src/lib/youtube/errors';
import { analyzeWithGemini } from '../src/lib/gemini';
import { renderBibliographyMarkdown, workProductName } from '../src/lib/bibliography/markdown';

/**
 * Runs the end-to-end YouTube transcript to Markdown work-product workflow.
 * @param videoUrl Public YouTube URL.
 * @returns Absolute path to the saved Markdown file.
 * @throws Error when credentials, transcript access, model output, or persistence fails.
 */
export async function analyzeYouTube(videoUrl: string): Promise<string> {
  const transcript = await fetchYouTubeTranscript(videoUrl);
  const text = transcript.cues.map((cue) => `[${cue.start.toFixed(2)}s] ${cue.text}`).join('\n');
  const bibliography = await analyzeWithGemini(transcript.videoUrl, transcript.title, text);
  const markdown = renderBibliographyMarkdown(bibliography);
  const folder = workProductName(transcript.title);
  const root = resolve(process.env.BIBLIOGRAPHY_OUTPUT_ROOT || './bibliographies');
  const outputDirectory = join(root, folder);
  await mkdir(join(outputDirectory, '.thumbs.db'), { recursive: true });
  const outputFile = join(outputDirectory, `${folder}.md`);
  await writeFile(outputFile, markdown, 'utf8');
  return outputFile;
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
