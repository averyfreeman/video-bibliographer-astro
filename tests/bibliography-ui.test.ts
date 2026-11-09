import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const component = readFileSync(new URL('../src/components/BibliographyShowcase.astro', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

describe('bibliography browsing presentation', () => {
  it('keeps timeline navigation, evidence labels, source links, and image alt text in the component', () => {
    expect(component).toContain('aria-label="Historical references in video order"');
    expect(component).toContain('href={`#reference-${index + 1}`}');
    expect(component).toContain('sourceVerification');
    expect(component).toContain('target="_blank" rel="noreferrer"');
    expect(component).toContain('alt={reference.thumbnail.alt}');
    expect(component).toContain('no image is being claimed');
  });

  it('provides reduced-motion handling and deterministic reveal variants', () => {
    expect(component).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(component).toContain("['rise', 'slide', 'fade']");
    expect(styles).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(styles).toContain('vb-reveal-ready');
  });
});
