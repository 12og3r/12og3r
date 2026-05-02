import type { Post, Lang } from '@/types';

interface RssOptions {
  posts: Post[];
  lang: Lang;
  siteUrl: string;
  siteTitle?: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildRssXml({ posts, lang, siteUrl, siteTitle = 'roger@blog' }: RssOptions): string {
  const items = posts.map(p => {
    const chapter0 = p.chapters[lang][0];
    const title = chapter0?.title || p.meta.slug;
    const description = p.chapters[lang].map(c => c.body).join('\n\n');
    const url = `${siteUrl}/${lang}/posts/${p.meta.slug}`;
    const pubDate = new Date(p.meta.date).toUTCString();
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteTitle)}</description>
    <language>${lang}</language>
${items}
  </channel>
</rss>`;
}
