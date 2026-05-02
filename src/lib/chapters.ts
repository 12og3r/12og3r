import type { Chapter } from '@/types';

const MARKER = /^---chapter:\s*(.*?)\s*---\s*$/m;

export function parseChapters(text: string): Chapter[] {
  if (!text) return [{ title: '', body: '' }];

  const lines = text.split('\n');
  let currentTitle = '';
  let currentBody: string[] = [];
  const out: Chapter[] = [];
  let sawAnyMarker = false;

  const flush = () => {
    out.push({ title: currentTitle, body: currentBody.join('\n').trim() });
  };

  for (const line of lines) {
    const m = line.match(MARKER);
    if (m) {
      if (sawAnyMarker) flush();
      else if (currentBody.some(l => l.trim() !== '')) {
        throw new Error('Content found before first chapter marker');
      }
      currentTitle = m[1];
      currentBody = [];
      sawAnyMarker = true;
    } else {
      currentBody.push(line);
    }
  }

  if (sawAnyMarker) {
    flush();
  } else {
    out.push({ title: '', body: currentBody.join('\n').trim() });
  }

  return out;
}
