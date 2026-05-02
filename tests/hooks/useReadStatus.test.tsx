import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReadStatus } from '@/hooks/useReadStatus';

describe('useReadStatus', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const { result } = renderHook(() => useReadStatus());
    expect(result.current.isRead('0034')).toBe(false);
  });

  it('marks slug as read', () => {
    const { result } = renderHook(() => useReadStatus());
    act(() => result.current.markRead('0034'));
    expect(result.current.isRead('0034')).toBe(true);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useReadStatus());
    act(() => result.current.markRead('0034'));
    expect(localStorage.getItem('blog.read')).toContain('0034');
  });

  it('hydrates from localStorage on init', () => {
    localStorage.setItem('blog.read', JSON.stringify(['0034', '0033']));
    const { result } = renderHook(() => useReadStatus());
    expect(result.current.isRead('0034')).toBe(true);
    expect(result.current.isRead('0033')).toBe(true);
  });

  it('does not duplicate slugs', () => {
    const { result } = renderHook(() => useReadStatus());
    act(() => { result.current.markRead('0034'); result.current.markRead('0034'); });
    const stored = JSON.parse(localStorage.getItem('blog.read')!);
    expect(stored).toEqual(['0034']);
  });
});
