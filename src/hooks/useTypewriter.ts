import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';

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
  // Initial render shows the first character (not empty), so when a previously
  // hidden chapter becomes visible there's no flash of empty content before
  // typing starts.
  const [text, setText] = useState(() => (enabled ? target.slice(0, 1) : target));
  const [done, setDone] = useState(() => !enabled || target.length <= 1);
  const indexRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  // Sync setup runs BEFORE browser paint. When a locked chapter unlocks,
  // its text state was the full body — without useLayoutEffect, the browser
  // would paint that full body for one frame before the typewriter resets.
  useLayoutEffect(() => {
    if (!enabled) {
      setText(target);
      setDone(true);
      return;
    }
    // Mid-run target change (lang switch): snap to full new target,
    // don't replay. Spec §8.4.
    if (startedRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setText(target);
      setDone(true);
      return;
    }
    startedRef.current = true;
    indexRef.current = 1;
    setText(target.slice(0, 1));
    setDone(target.length <= 1);
  }, [target, enabled]);

  // Typewriter timer runs after paint.
  useEffect(() => {
    if (!enabled) return;
    if (!startedRef.current) return;
    if (indexRef.current >= target.length) return;

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
