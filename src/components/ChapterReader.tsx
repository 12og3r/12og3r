import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useTypewriter } from '@/hooks/useTypewriter';
import type { Chapter } from '@/types';
import './ChapterReader.css';

interface Props {
  chapters: Chapter[];
  reduceMotion: boolean;
  onComplete: () => void;
}

export function ChapterReader({ chapters, reduceMotion, onComplete }: Props) {
  const { t } = useI18n();
  const [unlockedIdx, setUnlockedIdx] = useState(reduceMotion ? chapters.length - 1 : 0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  useEffect(() => {
    if (reduceMotion) onComplete();
  }, [reduceMotion, onComplete]);

  const advance = useCallback(() => {
    setUnlockedIdx(i => {
      const next = Math.min(i + 1, chapters.length - 1);
      if (next === chapters.length - 1) onComplete();
      return next;
    });
  }, [chapters.length, onComplete]);

  const skipAll = useCallback(() => {
    setUnlockedIdx(chapters.length - 1);
    onComplete();
  }, [chapters.length, onComplete]);

  useEffect(() => {
    if (reduceMotion) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
      else if (e.key === 'Escape') { skipAll(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [advance, skipAll, reduceMotion]);

  return (
    <div className="chapter-reader">
      <div className="chapter-topbar">
        <span className="progress">{t('post.chapter')} {Math.min(unlockedIdx + 1, chapters.length)} / {chapters.length}</span>
        {!reduceMotion && unlockedIdx < chapters.length - 1 && (
          <span className="skip-btn" onClick={skipAll}>{t('post.skip')}</span>
        )}
      </div>
      {chapters.map((ch, i) => (
        <ChapterBlock
          key={i}
          chapter={ch}
          locked={!reduceMotion && i > unlockedIdx}
          active={!reduceMotion && i === unlockedIdx}
          showContinue={!reduceMotion && i === unlockedIdx && i < chapters.length - 1}
          isMobile={isMobile}
          onContinue={advance}
        />
      ))}
    </div>
  );
}

interface ChapterBlockProps {
  chapter: Chapter;
  locked: boolean;
  active: boolean;
  showContinue: boolean;
  isMobile: boolean;
  onContinue: () => void;
}

function ChapterBlock({ chapter, locked, active, showContinue, isMobile, onContinue }: ChapterBlockProps) {
  const { t } = useI18n();
  const { text, done } = useTypewriter(chapter.body, { speedMs: 10, enabled: active && !locked });
  const display = locked ? chapter.body : (active ? text : chapter.body);
  return (
    <div className={`chapter ${locked ? 'locked' : ''}`}>
      <div className="chapter-title">// {chapter.title}</div>
      <pre className="chapter-body">{display}</pre>
      {showContinue && done && (
        <div className="continue-prompt" onClick={onContinue}>
          {isMobile ? t('post.continue.mobile') : t('post.continue.desktop')}
        </div>
      )}
    </div>
  );
}
