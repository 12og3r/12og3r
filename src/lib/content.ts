import { parse as parseYaml } from 'yaml';
import { parseChapters } from './chapters';
import type { Post, PostMeta } from '@/types';

export function parsePostMeta(yamlText: string): PostMeta {
  const data = parseYaml(yamlText);
  if (!data?.slug) throw new Error('meta.yaml: missing slug');
  if (!data?.date) throw new Error('meta.yaml: missing date');
  return {
    slug: String(data.slug),
    date: String(data.date),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: {
      en: Number(data.readingTime?.en ?? 0),
      zh: Number(data.readingTime?.zh ?? 0),
    },
    pinned: Boolean(data.pinned),
  };
}

export interface RawPostSources {
  metaYaml: string;
  enMdx: string;
  zhMdx: string;
}

export function buildPostFromRawSources(raw: RawPostSources): Post {
  const meta = parsePostMeta(raw.metaYaml);
  const en = parseChapters(raw.enMdx);
  const zh = parseChapters(raw.zhMdx);
  if (en.length !== zh.length) {
    throw new Error(`Chapter count mismatch for ${meta.slug}: en=${en.length}, zh=${zh.length}`);
  }
  return { meta, chapters: { en, zh } };
}

let _cache: Promise<Post[]> | null = null;

export function loadAllPosts(): Promise<Post[]> {
  return _cache ??= _loadAllPostsImpl();
}

async function _loadAllPostsImpl(): Promise<Post[]> {
  const metaModules = import.meta.glob('/content/posts/*/meta.yaml', { query: '?raw', import: 'default' });
  const enModules = import.meta.glob('/content/posts/*/en.mdx', { query: '?raw', import: 'default' });
  const zhModules = import.meta.glob('/content/posts/*/zh.mdx', { query: '?raw', import: 'default' });

  const slugFromPath = (p: string) => p.split('/').slice(-2, -1)[0];

  const slugs = [...new Set(Object.keys(metaModules).map(slugFromPath))];
  const posts: Post[] = [];

  for (const slug of slugs) {
    const metaKey = Object.keys(metaModules).find(k => slugFromPath(k) === slug)!;
    const enKey = Object.keys(enModules).find(k => slugFromPath(k) === slug);
    const zhKey = Object.keys(zhModules).find(k => slugFromPath(k) === slug);
    if (!enKey || !zhKey) {
      throw new Error(`Post ${slug}: missing en.mdx or zh.mdx`);
    }
    const [metaYaml, enMdx, zhMdx] = await Promise.all([
      metaModules[metaKey](), enModules[enKey](), zhModules[zhKey](),
    ]);
    posts.push(buildPostFromRawSources({
      metaYaml: metaYaml as string,
      enMdx: enMdx as string,
      zhMdx: zhMdx as string,
    }));
  }

  posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date));
  return posts;
}
