import { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseTagFilterResult {
  selected: string[];
  toggle: (tag: string) => void;
  clear: () => void;
  matches: (postTags: string[]) => boolean;
}

function parseTags(raw: string | null): string[] {
  return raw ? raw.split(',').filter(Boolean) : [];
}

export function useTagFilter(): UseTagFilterResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<string[]>(() => parseTags(searchParams.get('tags')));

  // Sync local state when URL changes externally (back/forward navigation).
  useEffect(() => {
    const fromUrl = parseTags(searchParams.get('tags'));
    setSelected(prev => (prev.join(',') === fromUrl.join(',') ? prev : fromUrl));
  }, [searchParams]);

  // Mirror local state to URL.
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const current = parseTags(params.get('tags'));
    if (current.join(',') === selected.join(',')) return;
    if (selected.length === 0) params.delete('tags');
    else params.set('tags', selected.join(','));
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const toggle = useCallback((tag: string) => {
    setSelected(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const matches = useCallback(
    (postTags: string[]) => {
      if (selected.length === 0) return true;
      return selected.some(t => postTags.includes(t));
    },
    [selected]
  );

  return { selected, toggle, clear, matches };
}
