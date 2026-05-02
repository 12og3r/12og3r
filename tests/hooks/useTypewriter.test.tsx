import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from '@/hooks/useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with the first character (not empty) to avoid flash', () => {
    const { result } = renderHook(() => useTypewriter('hello', { speedMs: 10, enabled: true }));
    expect(result.current.text).toBe('h');
    expect(result.current.done).toBe(false);
  });

  it('types characters over time', async () => {
    const { result } = renderHook(() => useTypewriter('hi', { speedMs: 10, enabled: true }));
    await act(async () => { await vi.advanceTimersByTimeAsync(15); });
    expect(result.current.text.length).toBeGreaterThanOrEqual(1);
  });

  it('completes when all characters typed', async () => {
    const { result } = renderHook(() => useTypewriter('hi', { speedMs: 5, enabled: true }));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.text).toBe('hi');
    expect(result.current.done).toBe(true);
  });

  it('skip jumps to end immediately', async () => {
    const { result } = renderHook(() => useTypewriter('long text here', { speedMs: 10, enabled: true }));
    act(() => result.current.skip());
    expect(result.current.text).toBe('long text here');
    expect(result.current.done).toBe(true);
  });

  it('disabled returns full text immediately', () => {
    const { result } = renderHook(() => useTypewriter('hello', { speedMs: 10, enabled: false }));
    expect(result.current.text).toBe('hello');
    expect(result.current.done).toBe(true);
  });

  it('snaps to full target when target changes mid-run (lang switch)', async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useTypewriter(target, { speedMs: 5, enabled: true }),
      { initialProps: { target: 'hello there friend' } }
    );
    // partway through typing
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    // target changes (simulating lang switch)
    rerender({ target: '你好朋友' });
    expect(result.current.text).toBe('你好朋友');
    expect(result.current.done).toBe(true);
  });
});
