import type { Bibliography, MarkdownBibliographyReference } from './types';
import { validateBibliography } from './analysis';

/**
 * Renders a bibliography into the exact Markdown work-product format.
 * @param input Bibliography to render.
 * @returns Markdown containing the timeline, citations, and processing notes.
 */
export function renderBibliographyMarkdown(input: Bibliography): string {
  const bibliography = validateBibliography(input);
  const timeline = bibliography.references.length
    ? bibliography.references.map((ref) => `| ${ref.timestamp} | ${ref.timelineLabel} | ${ref.confidence.toFixed(2)} |`).join('\n')
    : '| — | No references identified | — |';
  const citations = bibliography.references.map((ref: MarkdownBibliographyReference) => [
    `## ${ref.timestamp} — ${ref.subject}`,
    '',
    `**Confidence:** ${ref.confidence.toFixed(2)}  `,
    `**Quote:** “${ref.quote}”  `,
    `**Original source:** [${ref.sourceUrl}](${ref.sourceUrl})`,
    '',
    `**Context:** ${ref.context}`,
    '',
    ref.significance,
    ref.disclaimer ? `\n\n> **Uncertainty:** ${ref.disclaimer}` : '',
    ref.thumbnail ? `\n\n*Thumbnail: ${ref.thumbnail.kind} — ${ref.thumbnail.alt} Provenance: ${ref.thumbnail.provenance}*` : '',
    !ref.thumbnail && ref.thumbnailAlt ? `\n\n*Thumbnail: ${ref.thumbnailKind ?? 'illustrative'} — ${ref.thumbnailAlt}*` : '',
  ].join('\n')).join('\n\n');
  return [
    `# ${bibliography.videoTitle}`,
    '',
    `**Video:** ${bibliography.videoUrl}`,
    '',
    '## Timeline',
    '',
    '| Video time | Reference | Confidence |',
    '| --- | --- | ---: |',
    timeline,
    '',
    citations || 'No references were returned.',
    '',
    '## Processing notes',
    '',
    ...bibliography.processingNotes.map((note) => `- ${note}`),
    '',
  ].join('\n');
}

/**
 * Creates the required output folder/file names from a title and timestamp.
 * @param title Source video title.
 * @param date Date used for deterministic naming.
 * @returns A filesystem-safe folder slug and Markdown filename.
 */
export function workProductName(title: string, date = new Date()): string {
  const safeTitle = title.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 32) || 'untitled_video';
  const stamp = date.toISOString().replace('T', '_').replace(/:/g, '_').slice(0, 19);
  return `${stamp}_${safeTitle}`;
}
