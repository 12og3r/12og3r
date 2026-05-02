import { useI18n } from '@/hooks/useI18n';
import type { Lang } from '@/types';
import './LangSwitcher.css';

export function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switcher">
      {(['en', 'zh'] as Lang[]).map(l => (
        <button
          type="button"
          key={l}
          className={`lang-pill ${lang === l ? 'active' : ''}`}
          onClick={() => setLang(l)}
        >
          {l === 'en' ? 'EN' : '中文'}
        </button>
      ))}
    </div>
  );
}
