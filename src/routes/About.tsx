import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/hooks/useI18n';
import aboutYaml from '/content/about.yaml?raw';
import { parse as parseYaml } from 'yaml';
import './About.css';

const ABOUT = parseYaml(aboutYaml) as { en: string; zh: string };

export default function About() {
  const { lang } = useI18n();
  return (
    <>
      <TopBar />
      <main className="about">
        <pre>{ABOUT[lang]}</pre>
      </main>
    </>
  );
}
