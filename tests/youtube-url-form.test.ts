import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractYouTubeId } from '../src/lib/youtube';

describe('YouTube URL input', () => {
  it.each([
    ['watch URL with a start-time parameter', 'https://www.youtube.com/watch?v=t38LbMVoPCs&t=1674s'],
    ['short youtu.be URL with a query parameter', 'https://youtu.be/t38LbMVoPCs?si=demo&t=12'],
    ['embedded player URL with query parameters', 'https://www.youtube.com/embed/t38LbMVoPCs?start=90&feature=oembed'],
    ['shorts URL copied from mobile', 'https://www.youtube.com/shorts/t38LbMVoPCs?feature=share'],
    ['live URL copied with a tracking query', 'https://www.youtube.com/live/t38LbMVoPCs?si=demo&t=34'],
  ])('accepts a copied %s', (_label, input) => {
    expect(extractYouTubeId(input)).toBe('t38LbMVoPCs');
  });

  it.each([
    'https://www.notyoutube.com/watch?v=t38LbMVoPCs',
    'https://youtube.com.evil.test/watch?v=t38LbMVoPCs',
    'https://www.youtube.com/watch?v=too-short',
    'https://www.youtube.com/shorts/not_a_valid_id',
  ])('rejects unsupported or unsafe input: %s', (input) => {
    expect(extractYouTubeId(input)).toBeNull();
  });

  it('keeps an accessible branded home entry point without starter copy', () => {
    const home = readFileSync(new URL('../src/content/docs/index.mdx', import.meta.url), 'utf8');
    const form = readFileSync(new URL('../src/components/VideoUrlForm.astro', import.meta.url), 'utf8');

    expect(home).toContain('Video Bibliographer');
    expect(home).toContain('<VideoUrlForm />');
    expect(form).toContain('id="video-url"');
    expect(form).toContain('for="video-url"');
    expect(form).toContain('name="url"');
    expect(form).toContain('inputmode="url"');
    expect(form).toContain('autocomplete="url"');
    expect(form).toContain("action = '/api/analyze'");
    expect(form).toContain('method="post"');
    expect(form).toContain("method: 'POST'");
    expect(form).toContain("JSON.stringify({ url: input.value })");
    expect(form).toContain("const logPrefix = '[Video Bibliographer]'");
    expect(form).toContain("logStage('submit'");
    expect(form).toContain("logStage('request-start'");
    expect(form).toContain("logStage('response-received'");
    expect(form).toContain("logStage('analysis-complete'");
    expect(form).toContain("logFailure('analysis-failed'");
    expect(form).toContain("logFailure('request-failed'");
    expect(form).not.toContain('console.log(input.value');
    expect(form).not.toContain('console.log(payload');
    expect(form).not.toContain('OPENAI_API_KEY');
    expect(form).toContain('Analyze video');
    expect(home).not.toMatch(/Starlight starter|Welcome to your new Astro project|Edit this page/i);
  });

  it('keeps development binding configured for 0.0.0.0:4321', () => {
    const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
    const astroConfig = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');

    expect(packageJson).toContain('astro dev --host 0.0.0.0');
    expect(astroConfig).toContain("host: '0.0.0.0'");
    expect(astroConfig).toContain('port: 4321');
  });
});
