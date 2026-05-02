import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '@/i18n/en.json';
import zh from '@/i18n/zh.json';
import type { Lang } from '@/types';

type Dict = Record<string, string>;
const DICTS: Record<Lang, Dict> = { en, zh };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'blog.lang';

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'zh') return saved;
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('lang-switching');
      setTimeout(() => document.body.classList.remove('lang-switching'), 400);
    }
    setLangState(l);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const dict = DICTS[lang];
    let s = dict[key] ?? DICTS.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return s;
  }, [lang]);

  return React.createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
