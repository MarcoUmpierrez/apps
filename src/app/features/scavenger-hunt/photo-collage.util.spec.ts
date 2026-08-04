import { vi } from 'vitest';
import { buildCollage, downloadDataUrl } from './photo-collage.util';

describe('buildCollage', () => {
  it('returns null when there are no photos', async () => {
    expect(await buildCollage([], 'Our journey')).toBeNull();
  });
});

describe('downloadDataUrl', () => {
  it('creates a temporary anchor with the given href and filename, and clicks it', () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') el.click = clickSpy;
      return el;
    });

    downloadDataUrl('data:image/jpeg;base64,abc', 'our-journey.jpg');

    expect(clickSpy).toHaveBeenCalledOnce();
    createElementSpy.mockRestore();
  });
});
