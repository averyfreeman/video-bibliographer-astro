import { describe, expect, it } from 'vitest';
import { extractYouTubeId } from '../src/lib/youtube';

describe('YouTube URL input', () => {
  it('accepts a copied watch URL with a start-time parameter', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=t38LbMVoPCs&t=1674s')).toBe('t38LbMVoPCs');
  });
});
