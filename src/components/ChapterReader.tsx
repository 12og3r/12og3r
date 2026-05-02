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
          <button type="button" className="skip-btn" onClick={skipAll}>{t('post.skip')}</button>
        )}
      </div>
      {chapters.map((ch, i) => {
        // Only render chapters that have been unlocked. Page height grows as
        // the reader advances, instead of pre-allocating space for every chapter.
        if (i > unlockedIdx) return null;
        const active = !reduceMotion && i === unlockedIdx;
        return (
          <ChapterBlock
            key={i}
            chapter={ch}
            active={active}
            showContinue={active && i < chapters.length - 1}
            isMobile={isMobile}
            onContinue={advance}
          />
        );
      })}
    </div>
  );
}

interface ChapterBlockProps {
  chapter: Chapter;
  active: boolean;
  showContinue: boolean;
  isMobile: boolean;
  onContinue: () => void;
}

function ChapterBlock({ chapter, active, showContinue, isMobile, onContinue }: ChapterBlockProps) {
  const { t } = useI18n();
  const { text, done } = useTypewriter(chapter.body, { speedMs: 10, enabled: active });
  const [showCue, setShowCue] = useState(false);

  // Only reveal the continue button after the chapter has FULLY typed out,
  // and only after a short read-pause so it doesn't feel like the button
  // pops in while content is still arriving.
  useEffect(() => {
    if (!showContinue || !done || text !== chapter.body) {
      setShowCue(false);
      return;
    }
    const tid = setTimeout(() => setShowCue(true), 350);
    return () => clearTimeout(tid);
  }, [showContinue, done, text, chapter.body]);

  const display = active ? text : chapter.body;
  return (
    <div className="chapter">
      <div className="chapter-title">// {chapter.title}</div>
      <pre className="chapter-body">{display}</pre>
      {showCue && (
        <button type="button" className="continue-prompt" onClick={onContinue}>
          {isMobile ? t('post.continue.mobile') : t('post.continue.desktop')}
        </button>
      )}
    </div>
  );
}
