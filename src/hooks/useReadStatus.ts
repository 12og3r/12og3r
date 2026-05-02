import { useCallback, useState } from 'react';

const STORAGE_KEY = 'blog.read';

function load(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useReadStatus() {
  const [readSet, setReadSet] = useState<Set<string>>(() => new Set(load()));

  const isRead = useCallback((slug: string) => readSet.has(slug), [readSet]);

  const markRead = useCallback((slug: string) => {
    setReadSet(prev => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev);
      next.add(slug);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      }
      return next;
    });
  }, []);

  return { isRead, markRead };
}
