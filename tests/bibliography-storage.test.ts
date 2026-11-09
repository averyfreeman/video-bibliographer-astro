import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { BibliographyStorageError, persistBibliographyMarkdown } from '../src/lib/bibliography/storage';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('bibliography Markdown storage', () => {
  it('retains exact Markdown bytes and creates the required thumbnail directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'video-bibliographer-storage-'));
    roots.push(root);
    const markdown = '# Exact output\n\n*Do not regenerate me.*\n';

    const outputFile = await persistBibliographyMarkdown({
      root,
      folderName: '2026-08-30_12_34_56_Fixture_video',
      markdown,
    });

    expect(await readFile(outputFile, 'utf8')).toBe(markdown);
    expect(await readdir(join(root, '2026-08-30_12_34_56_Fixture_video', '.thumbs.db'))).toEqual([]);
  });

  it('fails closed when the generated folder already exists', async () => {
    const root = await mkdtemp(join(tmpdir(), 'video-bibliographer-storage-'));
    roots.push(root);
    const options = { root, folderName: '2026-08-30_12_34_56_Fixture_video', markdown: '# Original\n' };

    const outputFile = await persistBibliographyMarkdown(options);
    await expect(persistBibliographyMarkdown({ ...options, markdown: '# Replacement\n' }))
      .rejects.toBeInstanceOf(BibliographyStorageError);
    expect(await readFile(outputFile, 'utf8')).toBe('# Original\n');
  });
});
