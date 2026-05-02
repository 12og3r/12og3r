import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useI18n, I18nProvider } from '@/hooks/useI18n';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

describe('useI18n', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to English', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.lang).toBe('en');
    expect(result.current.t('panel.tags')).toBe('// tags');
  });

  it('switches language and updates t()', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    act(() => result.current.setLang('zh'));
    expect(result.current.lang).toBe('zh');
    expect(result.current.t('panel.tags')).toBe('// 标签');
  });

  it('persists language to localStorage', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    act(() => result.current.setLang('zh'));
    expect(localStorage.getItem('blog.lang')).toBe('zh');
  });

  it('substitutes {n} variables', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('count.entries', { n: 47 })).toBe('— 47 entries');
  });

  it('falls back to key when string missing', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });
});
