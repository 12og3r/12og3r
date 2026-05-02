import { useI18n } from '@/hooks/useI18n';
import { loadNow } from '@/lib/now';
import './NowPanel.css';

export function NowPanel() {
  const { lang, t } = useI18n();
  const now = loadNow();
  return (
    <div className="panel now-panel">
      <div className="panel-title">{t('panel.now')}</div>
      <div className="now-line"><span className="k">{t('now.work')}</span> {now.work[lang]}</div>
      <div className="now-line"><span className="k">{t('now.read')}</span> {now.read[lang]}</div>
      <div className="now-line"><span className="k">{t('now.build')}</span> {now.build[lang]}</div>
      <div className="now-updated">{t('now.updated')}: {now.lastUpdated}</div>
    </div>
  );
}
