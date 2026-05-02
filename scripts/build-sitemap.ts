import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = process.env.SITE_URL || 'https://example.com';
const POSTS_DIR = 'content/posts';

const slugs = readdirSync(POSTS_DIR);
const dates = slugs.map(slug => {
  const yaml = readFileSync(join(POSTS_DIR, slug, 'meta.yaml'), 'utf-8');
  const m = yaml.match(/^date:\s*(\S+)/m);
  return { slug, date: m ? m[1] : '2026-01-01' };
});

const langs = ['en', 'zh'];
const urls: string[] = [];
langs.forEach(l => {
  urls.push(`<url><loc>${SITE_URL}/${l}</loc></url>`);
  urls.push(`<url><loc>${SITE_URL}/${l}/about</loc></url>`);
  dates.forEach(({ slug, date }) => {
    urls.push(`<url><loc>${SITE_URL}/${l}/posts/${slug}</loc><lastmod>${date}</lastmod></url>`);
  });
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

writeFileSync('dist/sitemap.xml', xml);
console.log('[sitemap] wrote dist/sitemap.xml');
