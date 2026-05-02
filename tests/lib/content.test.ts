import { describe, it, expect } from 'vitest';
import { parsePostMeta, buildPostFromRawSources } from '@/lib/content';

describe('parsePostMeta', () => {
  it('parses meta.yaml content', () => {
    const yaml = `
slug: 0034-test
date: 2026-04-28
tags:
  - android
readingTime:
  en: 8
  zh: 9
`;
    const meta = parsePostMeta(yaml);
    expect(meta.slug).toBe('0034-test');
    expect(meta.date).toBe('2026-04-28');
    expect(meta.tags).toEqual(['android']);
    expect(meta.readingTime.en).toBe(8);
  });
});

describe('buildPostFromRawSources', () => {
  it('combines meta and per-language MDX sources', () => {
    const post = buildPostFromRawSources({
      metaYaml: 'slug: x\ndate: 2026-01-01\ntags: []\nreadingTime: { en: 1, zh: 1 }',
      enMdx: '---chapter: hi---\nhello',
      zhMdx: '---chapter: 你好---\n大家好',
    });
    expect(post.meta.slug).toBe('x');
    expect(post.chapters.en[0].title).toBe('hi');
    expect(post.chapters.en[0].body).toBe('hello');
    expect(post.chapters.zh[0].title).toBe('你好');
    expect(post.chapters.zh[0].body).toBe('大家好');
  });

  it('throws when chapter counts differ between languages', () => {
    expect(() => buildPostFromRawSources({
      metaYaml: 'slug: x\ndate: 2026-01-01\ntags: []\nreadingTime: { en: 1, zh: 1 }',
      enMdx: '---chapter: a---\nA\n---chapter: b---\nB',
      zhMdx: '---chapter: a---\nA',
    })).toThrow(/chapter count/i);
  });
});
