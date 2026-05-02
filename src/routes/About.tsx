import { Fragment } from 'react';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/hooks/useI18n';
import aboutYaml from '/content/about.yaml?raw';
import { parse as parseYaml } from 'yaml';
import './About.css';

const ABOUT = parseYaml(aboutYaml) as { en: string; zh: string };

function renderLine(line: string, key: number) {
  if (line === '') {
    return <div key={key} className="about-blank">&nbsp;</div>;
  }

  const section = line.match(/^(──\s+)(.+?)(\s+──)$/);
  if (section) {
    return (
      <div key={key} className="about-section">
        <span className="rule">{section[1]}</span>
        <span className="label">{section[2]}</span>
        <span className="rule">{section[3]}</span>
      </div>
    );
  }

  if (line.startsWith('$ ')) {
    return (
      <div key={key} className="about-cmd">
        <span className="prompt">$</span> <span className="cmd">{line.slice(2)}</span>
      </div>
    );
  }

  if (line.startsWith('>')) {
    return <div key={key} className="about-quote">{line}</div>;
  }

  if (line.includes(' · ')) {
    const segments = line.split(' · ');
    return (
      <div key={key} className="about-list">
        {segments.map((seg, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="dot"> · </span>}
            <span className="item">{seg}</span>
          </Fragment>
        ))}
      </div>
    );
  }

  return <div key={key} className="about-body">{line}</div>;
}

export default function About() {
  const { lang } = useI18n();
  const lines = ABOUT[lang].split('\n');
  return (
    <>
      <TopBar />
      <main className="about">
        <div className="about-content">
          {lines.map((line, i) => renderLine(line, i))}
        </div>
      </main>
    </>
  );
}
