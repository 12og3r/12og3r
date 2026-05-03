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
  // Derive home state from the URL itself — `lang` may be out of sync with
  // pathname when the user toggles the language switcher without navigating.
  const isHome = /^\/(en|zh)\/?$/.test(pathname);
  return (
    <div className="topbar">
      <Link to={`/${lang}`} className="brand">
        <span className="dot" />/home/roger/blog
      </Link>
      <nav className="topnav">
        {!isHome && (
          articleFilename ? (
            <>
              <span className="prompt" aria-hidden="true">$</span>
              <span className="cmd">cat</span>
              <span className="filename">{articleFilename}</span>
            </>
          ) : (
            <Link to={`/${lang}`}>~</Link>
          )
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
