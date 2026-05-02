import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChapterReader } from '@/components/ChapterReader';
import { I18nProvider } from '@/hooks/useI18n';
import type { Chapter } from '@/types';

const chapters: Chapter[] = [
  { title: 'one', body: 'A.' },
  { title: 'two', body: 'B.' },
  { title: 'three', body: 'C.' },
];

function setup(props: Partial<React.ComponentProps<typeof ChapterReader>> = {}) {
  return render(
    <I18nProvider>
      <ChapterReader chapters={chapters} reduceMotion={true} onComplete={vi.fn()} {...props} />
    </I18nProvider>
  );
}

describe('ChapterReader (reduceMotion)', () => {
  it('renders all chapters when reduceMotion is true', () => {
    setup();
    const containers = document.querySelectorAll('.chapter');
    expect(containers.length).toBe(3);
  });

  it('all chapter bodies present in DOM (for SEO/a11y)', () => {
    const { container } = setup();
    expect(container.textContent).toContain('A.');
    expect(container.textContent).toContain('B.');
    expect(container.textContent).toContain('C.');
  });

  it('calls onComplete when reduceMotion (immediate completion)', () => {
    const onComplete = vi.fn();
    setup({ onComplete });
    expect(onComplete).toHaveBeenCalled();
  });
});

describe('ChapterReader (interactive)', () => {
  it('only first chapter is rendered initially', () => {
    render(
      <I18nProvider>
        <ChapterReader chapters={chapters} reduceMotion={false} onComplete={vi.fn()} />
      </I18nProvider>
    );
    const containers = document.querySelectorAll('.chapter');
    expect(containers.length).toBe(1);
  });

  it('skip button renders all chapters and calls onComplete', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ChapterReader chapters={chapters} reduceMotion={false} onComplete={onComplete} />
      </I18nProvider>
    );
    await user.click(screen.getByText(/SKIP/i));
    const containers = document.querySelectorAll('.chapter');
    expect(containers.length).toBe(3);
    expect(onComplete).toHaveBeenCalled();
  });
});
