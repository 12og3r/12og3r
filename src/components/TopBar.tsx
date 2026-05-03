import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import { LangSwitcher } from './LangSwitcher';
import './TopBar.css';

interface Props {
  /** When set, render this filename after a `/` separator (path-style). */
  articleFilename?: string;
  /** When set, render a SKIP button to the left of the language switcher. */
  onSkip?: () => void;
}

export function TopBar({ articleFilename, onSkip }: Props) {
  const { lang, t } = useI18n();
  const { pathname } = useLocation();
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  return (
    <div className="topbar">
      <Link to={`/${lang}`} className="brand">
        <span className="dot" />/home/roger/blog
      </Link>
      <nav className="topnav">
        {!isHome && (
          <>
            <Link to={`/${lang}`}>~</Link>
            {articleFilename && (
              <>
                <span className="path-sep" aria-hidden="true">/</span>
                <span className="filename">{articleFilename}</span>
              </>
            )}
          </>
        )}
      </nav>
      {onSkip && (
        <button type="button" className="topbar-skip" onClick={onSkip}>
          {t('post.skip')}
        </button>
      )}
      <LangSwitcher />
    </div>
  );
}
