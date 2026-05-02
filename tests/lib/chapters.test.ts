import { describe, it, expect } from 'vitest';
import { parseChapters } from '@/lib/chapters';

describe('parseChapters', () => {
  it('splits text by ---chapter: markers', () => {
    const input = `---chapter: the call---

It was 2:47 AM.

---chapter: the trace---

Reading ANR traces.`;
    const result = parseChapters(input);
    expect(result).toEqual([
      { title: 'the call', body: 'It was 2:47 AM.' },
      { title: 'the trace', body: 'Reading ANR traces.' },
    ]);
  });

  it('returns one chapter with no marker (entire body, untitled)', () => {
    const result = parseChapters('Just plain text.');
    expect(result).toEqual([{ title: '', body: 'Just plain text.' }]);
  });

  it('trims whitespace from body', () => {
    const result = parseChapters(`---chapter: a---\n\n  hello world  \n\n`);
    expect(result).toEqual([{ title: 'a', body: 'hello world' }]);
  });

  it('throws if first content is non-empty before any marker', () => {
    expect(() => parseChapters(`stray text\n---chapter: a---\nbody`)).toThrow(/before first chapter marker/i);
  });

  it('handles empty input', () => {
    expect(parseChapters('')).toEqual([{ title: '', body: '' }]);
  });
});
