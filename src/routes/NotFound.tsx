import { Link, useLocation } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/hooks/useI18n';
import './NotFound.css';

export default function NotFound() {
  const { pathname } = useLocation();
  const { lang, t } = useI18n();
  return (
    <>
      <TopBar />
      <main className="notfound">
        <pre className="cmd">{t('notfound.cmd', { path: pathname })}</pre>
        <div className="suggest">{t('notfound.suggest')}</div>
        <ul>
          <li><Link to={`/${lang}`}>$ cd ~ &nbsp;&nbsp;{t('notfound.home')}</Link></li>
          <li><Link to={`/${lang}`}>$ ls posts/ &nbsp;&nbsp;{t('notfound.browse')}</Link></li>
        </ul>
      </main>
    </>
  );
}
