import { useEffect, useRef, useState, useCallback } from 'react';

interface Options {
  speedMs: number;
  enabled: boolean;
}

interface Result {
  text: string;
  done: boolean;
  skip: () => void;
}

function delayForChar(ch: string, base: number): number {
  if ('.!?。！？'.includes(ch)) return base * 20;
  if (',;，；'.includes(ch)) return base * 8;
  if (ch === '\n') return base * 5;
  return base;
}

export function useTypewriter(target: string, opts: Options): Result {
  const { speedMs, enabled } = opts;
  const [text, setText] = useState(enabled ? '' : target);
  const [done, setDone] = useState(!enabled);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setText(target);
      setDone(true);
      return;
    }
    // If target changes after we've already started typing once,
    // snap to the full new target instead of replaying. This handles
    // language switch mid-article: spec §8.4 says unlocked chapters
    // should swap instantly, not retype.
    if (startedRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setText(target);
      setDone(true);
      return;
    }
    startedRef.current = true;
    indexRef.current = 0;
    setText('');
    setDone(false);

    const tick = () => {
      const i = indexRef.current;
      if (i >= target.length) {
        setDone(true);
        return;
      }
      const ch = target[i];
      setText(target.slice(0, i + 1));
      indexRef.current = i + 1;
      timerRef.current = setTimeout(tick, delayForChar(ch, speedMs));
    };
    timerRef.current = setTimeout(tick, speedMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [target, speedMs, enabled]);

  const skip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setText(target);
    setDone(true);
  }, [target]);

  return { text, done, skip };
}
