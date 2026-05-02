import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { ChapterReader } from '@/components/ChapterReader';
import { useI18n } from '@/hooks/useI18n';
import { useReadStatus } from '@/hooks/useReadStatus';
import { loadAllPosts } from '@/lib/content';
import type { Post } from '@/types';
import './Post.css';

export default function PostRoute() {
  const { slug } = useParams();
  const { lang, t } = useI18n();
  const { markRead } = useReadStatus();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => { loadAllPosts().then(setPosts); }, []);

  // Reset reader state when navigating between posts.
  useEffect(() => { setSkipped(false); setCompleted(false); }, [slug]);

  const handleComplete = useCallback(() => {
    if (slug) markRead(slug);
    // Brief read-pause before the end block appears.
    setTimeout(() => setCompleted(true), 350);
  }, [markRead, slug]);

  const handleSkip = useCallback(() => {
    setSkipped(true);
    handleComplete();
  }, [handleComplete]);

  if (posts === null) return <div className="loading">loading...</div>;

  const idx = posts.findIndex(p => p.meta.slug === slug);
  if (idx === -1) return <Navigate to={`/${lang}/404`} replace />;

  const post = posts[idx];
  const prev = posts[idx + 1];
  const next = posts[idx - 1];
  const chapters = post.chapters[lang];

  // Display the article like a filename: spaces → underscores, append .md
  const articleTitle = chapters[0]?.title || post.meta.slug;
  const articleFilename = `${articleTitle.replace(/\s+/g, '_')}.md`;

  const showSkip = !reduceMotion && !skipped && !completed;

  return (
    <>
      <TopBar
        articleFilename={articleFilename}
        onSkip={showSkip ? handleSkip : undefined}
      />
      <ChapterReader
        chapters={chapters}
        reduceMotion={reduceMotion}
        skipped={skipped}
        onSkipRequest={handleSkip}
        onComplete={handleComplete}
      />
      {completed && (
        <div className="post-end">
          <div className="end-mark">{t('post.end')}</div>
          <div className="end-note">{t('post.endNote')}</div>
          <nav className="post-nav">
            {prev && <Link to={`/${lang}/posts/${prev.meta.slug}`} className="prev">{t('post.prev')}: {prev.chapters[lang][0]?.title}</Link>}
            {next && <Link to={`/${lang}/posts/${next.meta.slug}`} className="next">{next.chapters[lang][0]?.title} :{t('post.next')}</Link>}
          </nav>
        </div>
      )}
      <footer className="page-footer">
        <span>{t('footer.copy')}</span> ·
        <a href="https://github.com/12og3r" target="_blank" rel="noreferrer">github</a> ·
        <a href="https://x.com/12ug3r" target="_blank" rel="noreferrer">twitter</a>
      </footer>
    </>
  );
}
