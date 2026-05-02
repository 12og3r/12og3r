import { Fragment } from 'react';
import './TermBlock.css';

interface Props {
  text: string;
  className?: string;
}

function renderLine(line: string, key: number) {
  if (line === '') {
    return <div key={key} className="term-blank">&nbsp;</div>;
  }

  const section = line.match(/^(──\s+)(.+?)(\s+──)$/);
  if (section) {
    return (
      <div key={key} className="term-section">
        <span className="term-rule">{section[1]}</span>
        <span className="term-label">{section[2]}</span>
        <span className="term-rule">{section[3]}</span>
      </div>
    );
  }

  if (line.startsWith('$ ')) {
    return (
      <div key={key} className="term-cmd">
        <span className="term-prompt">$</span> <span className="term-cmdtext">{line.slice(2)}</span>
      </div>
    );
  }

  if (line.startsWith('>')) {
    return <div key={key} className="term-quote">{line}</div>;
  }

  if (line.includes(' · ')) {
    const segments = line.split(' · ');
    return (
      <div key={key} className="term-list">
        {segments.map((seg, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="term-dot"> · </span>}
            <span className="term-item">{seg}</span>
          </Fragment>
        ))}
      </div>
    );
  }

  return <div key={key} className="term-body">{line}</div>;
}

export function TermBlock({ text, className = '' }: Props) {
  const lines = text.split('\n');
  return (
    <div className={`term-block ${className}`.trim()}>
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  );
}
