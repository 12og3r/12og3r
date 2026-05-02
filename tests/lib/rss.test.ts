import { describe, it, expect } from 'vitest';
import { buildRssXml } from '@/lib/rss';
import type { Post } from '@/types';

const samplePost: Post = {
  meta: {
    slug: '0034',
    date: '2026-04-28',
    tags: ['android'],
    readingTime: { en: 8, zh: 9 },
  },
  chapters: {
    en: [{ title: 'the call', body: 'It was 2:47 AM.' }],
    zh: [{ title: '警报', body: '凌晨 2:47。' }],
  },
};

describe('buildRssXml', () => {
  it('produces valid RSS 2.0 root element', () => {
    const xml = buildRssXml({ posts: [samplePost], lang: 'en', siteUrl: 'https://example.com' });
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('</rss>');
  });

  it('includes one item per post with title from first chapter', () => {
    const xml = buildRssXml({ posts: [samplePost], lang: 'en', siteUrl: 'https://example.com' });
    expect(xml).toContain('<item>');
    expect(xml).toContain('<title>the call</title>');
    expect(xml).toContain('https://example.com/en/posts/0034');
  });

  it('uses zh chapters when lang=zh', () => {
    const xml = buildRssXml({ posts: [samplePost], lang: 'zh', siteUrl: 'https://example.com' });
    expect(xml).toContain('<title>警报</title>');
    expect(xml).toContain('/zh/posts/0034');
  });

  it('escapes special XML chars in titles and bodies', () => {
    const post: Post = { ...samplePost, chapters: { en: [{ title: 'A & B', body: '<script>x</script>' }], zh: samplePost.chapters.zh } };
    const xml = buildRssXml({ posts: [post], lang: 'en', siteUrl: 'https://example.com' });
    expect(xml).toContain('A &amp; B');
    expect(xml).not.toContain('<script>');
  });
});
