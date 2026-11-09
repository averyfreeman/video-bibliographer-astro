import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/** A safe, user-facing failure raised while retaining a bibliography locally. */
export class BibliographyStorageError extends Error {
  /** Stable category for persistence failures. */
  readonly code: 'output-exists' | 'write-failed';
  /** Persistence conflicts and failures are not retried automatically. */
  readonly retryable = false;

  /**
   * Creates a storage error without exposing filesystem details to callers.
   * @param code Stable persistence failure category.
   * @param message Safe persistence diagnostic.
   * @param cause Original filesystem failure retained for server-side logging.
   */
  constructor(code: 'output-exists' | 'write-failed', message: string, cause?: unknown) {
    super(message);
    this.code = code;
    if (cause !== undefined) this.cause = cause;
    this.name = 'BibliographyStorageError';
  }
}

/** Options for exclusive Markdown work-product persistence. */
export interface PersistBibliographyMarkdownOptions {
  /** Root directory containing retained work-product folders. */
  root: string;
  /** Timestamped, filesystem-safe work-product folder name. */
  folderName: string;
  /** Exact Markdown bytes shown to the caller. */
  markdown: string;
}

/**
 * Creates a bibliography folder, thumbnail directory, and Markdown file exactly once.
 * @param options Output root, generated folder name, and exact rendered Markdown.
 * @returns Absolute path to the newly created Markdown file.
 * @throws BibliographyStorageError when the output exists or cannot be written.
 */
export async function persistBibliographyMarkdown(options: PersistBibliographyMarkdownOptions): Promise<string> {
  const root = resolve(options.root);
  const outputDirectory = join(root, options.folderName);
  const outputFile = join(outputDirectory, `${options.folderName}.md`);

  await mkdir(root, { recursive: true });
  try {
    await mkdir(outputDirectory);
    await mkdir(join(outputDirectory, '.thumbs.db'));
    await writeFile(outputFile, options.markdown, { encoding: 'utf8', flag: 'wx' });
  } catch (error: unknown) {
    const code = typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST'
      ? 'output-exists'
      : 'write-failed';
    throw new BibliographyStorageError(
      code,
      code === 'output-exists'
        ? 'A work product with this generated name already exists; no existing Markdown was overwritten.'
        : 'The bibliography work product could not be saved.',
      error,
    );
  }

  return outputFile;
}
