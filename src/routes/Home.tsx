import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { TagCloud } from '@/components/TagCloud';
import { NowPanel } from '@/components/NowPanel';
import { PostList } from '@/components/PostList';
import { TermBlock } from '@/components/TermBlock';
import { useI18n } from '@/hooks/useI18n';
import { useTagFilter } from '@/hooks/useTagFilter';
import { useReadStatus } from '@/hooks/useReadStatus';
import { loadAllPosts } from '@/lib/content';
import whoamiYaml from '/content/whoami.yaml?raw';
import { parse as parseYaml } from 'yaml';
import type { Post, PostSummary } from '@/types';
import './Home.css';

const WHOAMI = parseYaml(whoamiYaml) as { en: string; zh: string };

function truncate(s: string, n: number): string {
  const clean = s.replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n).trimEnd() + '…' : clean;
}

export default function Home() {
  const { t, lang } = useI18n();
  const { selected, toggle, clear, matches } = useTagFilter();
  const { isRead } = useReadStatus();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => { loadAllPosts().then(setPosts); }, []);

  const summaries: PostSummary[] = posts.map(p => ({
    meta: p.meta,
    title: { en: p.chapters.en[0]?.title || p.meta.slug, zh: p.chapters.zh[0]?.title || p.meta.slug },
    excerpt: {
      en: truncate(p.chapters.en[0]?.body || '', 110),
      zh: truncate(p.chapters.zh[0]?.body || '', 55),
    },
  }));

  const filtered = summaries.filter(s => matches(s.meta.tags));

  const tagCounts: Record<string, number> = {};
  summaries.forEach(s => s.meta.tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }));

  const readSlugs = filtered.filter(s => isRead(s.meta.slug)).map(s => s.meta.slug);

  return (
    <>
      <TopBar />
      <div className="home-layout">
        <aside className="sidebar">
          <div className="panel">
            <div className="panel-title">
              <span>{t('panel.tags')}</span>
              {selected.length > 0 && <span className="badge">{t('badge.selected', { n: selected.length })}</span>}
            </div>
            <TagCloud counts={tagCounts} selected={selected} onToggle={toggle} />
          </div>
          <NowPanel />
        </aside>
        <main className="main">
          <TermBlock text={WHOAMI[lang]} className="whoami" />
          <h2>
            <span>{t('posts.title')} <span className="dim">{t(selected.length ? 'count.match' : 'count.entries', { n: filtered.length })}</span></span>
            <span className="dim">{t('posts.sort')}: <span style={{ color: 'var(--green)' }}>{t('posts.sort.newest')}</span></span>
          </h2>
          {selected.length > 0 && (
            <div className="filter-status">
              <span className="label">{t('filter.label')}</span>
              {selected.map(tag => <span key={tag} className="selected-tag">#{tag}</span>)}
              <button type="button" className="clear" onClick={clear}>{t('filter.clear')}</button>
            </div>
          )}
          <PostList summaries={filtered} readSlugs={readSlugs} />
        </main>
      </div>
      <footer>
        <span>{t('footer.copy')}</span> ·
        <a href="https://github.com/12og3r" target="_blank" rel="noreferrer">github</a> ·
        <a href="/rss.xml">rss</a> ·
        <a href="https://x.com/12ug3r" target="_blank" rel="noreferrer">twitter</a>
      </footer>
    </>
  );
}
