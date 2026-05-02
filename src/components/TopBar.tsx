import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import { LangSwitcher } from './LangSwitcher';
import './TopBar.css';

interface Props {
  /** When set, render this filename in place of the /about nav link. */
  articleFilename?: string;
  /** When set, render a SKIP button to the left of the language switcher. */
  onSkip?: () => void;
}

export function TopBar({ articleFilename, onSkip }: Props) {
  const { lang, t } = useI18n();
  const { pathname } = useLocation();
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const isAbout = pathname.startsWith(`/${lang}/about`);
  return (
    <div className="topbar">
      <Link to={`/${lang}`} className="brand">
        <span className="dot" />Roger's Space
      </Link>
      <nav className="topnav">
        <Link to={`/${lang}`} className={isHome ? 'active' : ''}>~</Link>
        {articleFilename ? (
          <>
            <span className="path-sep" aria-hidden="true">/</span>
            <span className="filename">{articleFilename}</span>
          </>
        ) : (
          <Link to={`/${lang}/about`} className={isAbout ? 'active' : ''}>{t('nav.about')}</Link>
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
