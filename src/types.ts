export type Lang = 'en' | 'zh';

export interface PostMeta {
  slug: string;
  date: string;        // ISO 8601 (YYYY-MM-DD)
  tags: string[];
  readingTime: { en: number; zh: number };
  pinned?: boolean;
}

export interface Chapter {
  title: string;       // 如 "the call"
  body: string;        // 该章节的 MDX/Markdown 文本
}

export interface Post {
  meta: PostMeta;
  chapters: { en: Chapter[]; zh: Chapter[] };
}

export interface PostSummary {
  meta: PostMeta;
  title: { en: string; zh: string };  // 文章主标题（取第一章 title 或 frontmatter 中标题字段）
}

export interface NowEntry {
  work: { en: string; zh: string };
  read: { en: string; zh: string };
  build: { en: string; zh: string };
  lastUpdated: string; // ISO 8601
}
