import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildPostFromRawSources } from '../src/lib/content';
import { buildRssXml } from '../src/lib/rss';
import type { Lang } from '../src/types';

const SITE_URL = process.env.SITE_URL || 'https://example.com';
const POSTS_DIR = 'content/posts';
const OUT_DIR = 'dist';

const slugs = readdirSync(POSTS_DIR);
const posts = slugs.map(slug => buildPostFromRawSources({
  metaYaml: readFileSync(join(POSTS_DIR, slug, 'meta.yaml'), 'utf-8'),
  enMdx: readFileSync(join(POSTS_DIR, slug, 'en.mdx'), 'utf-8'),
  zhMdx: readFileSync(join(POSTS_DIR, slug, 'zh.mdx'), 'utf-8'),
}));

posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date));

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

(['en', 'zh'] as Lang[]).forEach(lang => {
  const xml = buildRssXml({ posts, lang, siteUrl: SITE_URL });
  const path = lang === 'en' ? `${OUT_DIR}/rss.xml` : `${OUT_DIR}/rss-${lang}.xml`;
  writeFileSync(path, xml);
  console.log(`[rss] wrote ${path}`);
});
