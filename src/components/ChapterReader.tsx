import { useState, useEffect, useCallback, useRef } from 'react';
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
  // When the user clicks SKIP we want every chapter — including the current
  // one mid-typing — to fall back to its full body immediately, no further
  // typewriter on anything.
  const [skipped, setSkipped] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  useEffect(() => {
    if (reduceMotion) onComplete();
  }, [reduceMotion, onComplete]);

  const advance = useCallback(() => {
    setUnlockedIdx(i => Math.min(i + 1, chapters.length - 1));
  }, [chapters.length]);

  const skipAll = useCallback(() => {
    setSkipped(true);
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
        {!reduceMotion && !skipped && unlockedIdx < chapters.length - 1 && (
          <button type="button" className="skip-btn" onClick={skipAll}>{t('post.skip')}</button>
        )}
      </div>
      {chapters.map((ch, i) => {
        // Only render chapters that have been unlocked. Page height grows as
        // the reader advances, instead of pre-allocating space for every chapter.
        if (i > unlockedIdx) return null;
        // Skip → no chapter is "active": every chapter renders its full body
        // statically, no more typing on anyone.
        const active = !reduceMotion && !skipped && i === unlockedIdx;
        const isLast = i === chapters.length - 1;
        return (
          <ChapterBlock
            key={i}
            chapter={ch}
            active={active}
            showContinue={active && !isLast}
            isMobile={isMobile}
            onContinue={advance}
            onDone={isLast ? onComplete : undefined}
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
  onDone?: () => void;
}

function ChapterBlock({ chapter, active, showContinue, isMobile, onContinue, onDone }: ChapterBlockProps) {
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

  // For the final chapter, notify the parent once the typewriter has fully
  // finished so the post-end block can be shown only after real completion.
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  useEffect(() => {
    if (active && done && text === chapter.body && onDoneRef.current) {
      onDoneRef.current();
    }
  }, [active, done, text, chapter.body]);

  const display = active ? text : chapter.body;
  return (
    <div className="chapter">
      <pre className="chapter-body">
        {display}
        {active && (
          <span
            className={`cursor ${done && text === chapter.body ? 'cursor-idle' : ''}`}
            aria-hidden="true"
          >█</span>
        )}
      </pre>
      {showCue && (
        <button type="button" className="continue-prompt" onClick={onContinue}>
          {isMobile ? t('post.continue.mobile') : t('post.continue.desktop')}
        </button>
      )}
    </div>
  );
}
