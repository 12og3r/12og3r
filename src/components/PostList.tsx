import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import type { PostSummary } from '@/types';
import './PostList.css';

interface Props {
  summaries: PostSummary[];
  readSlugs: string[];
}

export function PostList({ summaries, readSlugs }: Props) {
  const { lang, t } = useI18n();
  const readSet = new Set(readSlugs);
  return (
    <div className="post-list">
      {summaries.map(s => (
        <Link
          key={s.meta.slug}
          to={`/${lang}/posts/${s.meta.slug}`}
          className={`post ${readSet.has(s.meta.slug) ? 'read' : ''}`}
        >
          <div className="post-date">{s.meta.date.replace(/-/g, '.')}</div>
          <div>
            <div className="post-title">{s.title[lang]}</div>
            <div className="post-tags">{s.meta.tags.map(t => `#${t}`).join(' ')}</div>
          </div>
          <div className="meta-right">{s.meta.readingTime[lang]} {t('post.min')} · {s.meta.slug}</div>
        </Link>
      ))}
    </div>
  );
}
