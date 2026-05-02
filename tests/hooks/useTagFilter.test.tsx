import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTagFilter } from '@/hooks/useTagFilter';
import React from 'react';

const wrapper = (initialPath = '/en') => ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, { initialEntries: [initialPath] }, children);

describe('useTagFilter', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    expect(result.current.selected).toEqual([]);
  });

  it('toggle adds and removes tags', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    act(() => result.current.toggle('android'));
    expect(result.current.selected).toEqual(['android']);
    act(() => result.current.toggle('debugging'));
    expect(result.current.selected).toEqual(['android', 'debugging']);
    act(() => result.current.toggle('android'));
    expect(result.current.selected).toEqual(['debugging']);
  });

  it('clear empties selection', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    act(() => { result.current.toggle('a'); result.current.toggle('b'); });
    act(() => result.current.clear());
    expect(result.current.selected).toEqual([]);
  });

  it('matches OR logic: post matches if it has ANY selected tag', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    act(() => { result.current.toggle('android'); result.current.toggle('career'); });
    expect(result.current.matches(['android'])).toBe(true);
    expect(result.current.matches(['career'])).toBe(true);
    expect(result.current.matches(['code'])).toBe(false);
    expect(result.current.matches([])).toBe(false);
  });

  it('empty selection matches everything', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    expect(result.current.matches(['anything'])).toBe(true);
    expect(result.current.matches([])).toBe(true);
  });

  it('reads initial state from URL ?tags=', () => {
    const { result } = renderHook(() => useTagFilter(), {
      wrapper: wrapper('/en?tags=android,debugging'),
    });
    expect(result.current.selected).toEqual(['android', 'debugging']);
  });
});
