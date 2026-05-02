import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import { LangSwitcher } from './LangSwitcher';
import './TopBar.css';

export function TopBar() {
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
        <Link to={`/${lang}/about`} className={isAbout ? 'active' : ''}>{t('nav.about')}</Link>
      </nav>
      <LangSwitcher />
    </div>
  );
}
