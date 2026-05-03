import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useTypewriter } from '@/hooks/useTypewriter';
import type { Chapter } from '@/types';
import './ChapterReader.css';

interface Props {
  chapters: Chapter[];
  reduceMotion: boolean;
  /** When true, every chapter renders its full body — no typewriter on any. */
  skipped: boolean;
  /** Called when the reader requests a skip (e.g. ESC keypress). */
  onSkipRequest: () => void;
  onComplete: () => void;
}

export function ChapterReader({ chapters, reduceMotion, skipped, onSkipRequest, onComplete }: Props) {
  const [unlockedIdx, setUnlockedIdx] = useState(reduceMotion ? chapters.length - 1 : 0);
  const [autoScroll, setAutoScroll] = useState(true);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // External skip → unlock all chapters.
  useEffect(() => {
    if (skipped) setUnlockedIdx(chapters.length - 1);
  }, [skipped, chapters.length]);

  useEffect(() => {
    if (reduceMotion) onComplete();
  }, [reduceMotion, onComplete]);

  const advance = useCallback(() => {
    setUnlockedIdx(i => Math.min(i + 1, chapters.length - 1));
    setAutoScroll(true);
  }, [chapters.length]);

  useEffect(() => {
    if (reduceMotion) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
      else if (e.key === 'Escape') { onSkipRequest(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [advance, onSkipRequest, reduceMotion]);

  // Manual-scroll detection: any wheel / touch-drag / nav-key from the user
  // disables auto-follow until the next advance().
  useEffect(() => {
    if (!autoScroll || reduceMotion || skipped) return;
    const cancel = () => setAutoScroll(false);
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) cancel();
    };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchmove', cancel, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchmove', cancel);
      window.removeEventListener('keydown', onKey);
    };
  }, [autoScroll, reduceMotion, skipped]);

  return (
    <div className="chapter-reader">
      {chapters.map((ch, i) => {
        if (i > unlockedIdx) return null;
        const active = !reduceMotion && !skipped && i === unlockedIdx;
        const isLast = i === chapters.length - 1;
        return (
          <ChapterBlock
            key={i}
            chapter={ch}
            active={active}
            autoScroll={autoScroll}
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
  autoScroll: boolean;
  showContinue: boolean;
  isMobile: boolean;
  onContinue: () => void;
  onDone?: () => void;
}

function ChapterBlock({ chapter, active, autoScroll, showContinue, isMobile, onContinue, onDone }: ChapterBlockProps) {
  const { t } = useI18n();
  const { text, done } = useTypewriter(chapter.body, { speedMs: 10, enabled: active });
  const [showCue, setShowCue] = useState(false);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  // Follow the typewriter cursor as it types.
  useEffect(() => {
    if (!active || !autoScroll || !cursorRef.current) return;
    const rect = cursorRef.current.getBoundingClientRect();
    const buffer = window.innerHeight * 0.25;
    if (rect.bottom > window.innerHeight - buffer) {
      const overflow = rect.bottom - (window.innerHeight - buffer);
      window.scrollBy({ top: overflow, behavior: 'smooth' });
    }
  }, [text, active, autoScroll]);

  useEffect(() => {
    if (!showContinue || !done || text !== chapter.body) {
      setShowCue(false);
      return;
    }
    const tid = setTimeout(() => setShowCue(true), 350);
    return () => clearTimeout(tid);
  }, [showContinue, done, text, chapter.body]);

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
            ref={cursorRef}
            className={`cursor ${done && text === chapter.body ? 'cursor-idle' : ''}`}
            aria-hidden="true"
          >▎</span>
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
