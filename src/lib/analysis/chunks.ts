import type { TranscriptCue } from '../youtube/types';
import type { TranscriptChunk } from './types';

const DEFAULT_MAX_CHARACTERS = 12_000;

function formatCue(cue: TranscriptCue): string {
  return `[${cue.start.toFixed(2)}s] ${cue.text.trim()}`;
}

function splitCue(cue: TranscriptCue, maxCharacters: number): TranscriptCue[] {
  const prefixLength = `[${cue.start.toFixed(2)}s] `.length;
  if (maxCharacters <= prefixLength) {
    throw new Error('Transcript chunk maxCharacters is too small for a timestamped cue.');
  }
  const textLimit = maxCharacters - prefixLength;
  const text = cue.text.trim();
  if (formatCue(cue).length <= maxCharacters) return [{ ...cue, text }];
  const fragments: TranscriptCue[] = [];
  for (let offset = 0; offset < text.length; offset += textLimit) {
    fragments.push({ start: cue.start, text: text.slice(offset, offset + textLimit) });
  }
  return fragments;
}

/**
 * Splits transcript cues into deterministic, bounded prompt chunks.
 * @param cues Ordered normalized transcript cues.
 * @param options Chunk character bound.
 * @returns Timestamp-preserving chunks whose formatted text does not exceed the bound.
 * @throws Error when `maxCharacters` is not a positive finite integer.
 */
export function chunkTranscriptCues(
  cues: TranscriptCue[],
  options: { maxCharacters?: number } = {},
): TranscriptChunk[] {
  const maxCharacters = options.maxCharacters ?? DEFAULT_MAX_CHARACTERS;
  if (!Number.isInteger(maxCharacters) || maxCharacters < 1) {
    throw new Error('Transcript chunk maxCharacters must be a positive integer.');
  }

  const normalizedCues = cues.flatMap((cue) => splitCue(cue, maxCharacters));
  const chunks: TranscriptChunk[] = [];
  let current: TranscriptCue[] = [];
  let currentText = '';

  const flush = (): void => {
    if (!current.length) return;
    chunks.push({
      index: chunks.length,
      cues: current,
      text: current.map(formatCue).join('\n'),
      startSeconds: current[0].start,
      endSeconds: current[current.length - 1].start,
    });
    current = [];
    currentText = '';
  };

  for (const cue of normalizedCues) {
    const line = formatCue(cue);
    const nextText = currentText ? `${currentText}\n${line}` : line;
    if (current.length && nextText.length > maxCharacters) flush();
    current.push(cue);
    currentText = currentText ? `${currentText}\n${line}` : line;
  }
  flush();
  return chunks;
}
