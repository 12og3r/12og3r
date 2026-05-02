import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PostList } from '@/components/PostList';
import { I18nProvider } from '@/hooks/useI18n';
import type { PostSummary } from '@/types';

const summaries: PostSummary[] = [
  {
    meta: { slug: '0034', date: '2026-04-28', tags: ['android'], readingTime: { en: 8, zh: 9 } },
    title: { en: 'Debugging ANR', zh: '调试 ANR' },
  },
  {
    meta: { slug: '0033', date: '2026-04-19', tags: ['career'], readingTime: { en: 6, zh: 7 } },
    title: { en: 'Leaving Motiff', zh: '离开 Motiff' },
  },
];

function setup(readSlugs: string[] = []) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <PostList summaries={summaries} readSlugs={readSlugs} />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('PostList', () => {
  it('renders all posts', () => {
    setup();
    expect(screen.getByText('Debugging ANR')).toBeInTheDocument();
    expect(screen.getByText('Leaving Motiff')).toBeInTheDocument();
  });

  it('marks read posts with .read class', () => {
    setup(['0033']);
    const post = screen.getByText('Leaving Motiff').closest('.post');
    expect(post).toHaveClass('read');
  });

  it('renders empty state when no posts', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <PostList summaries={[]} readSlugs={[]} />
        </I18nProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText(/Debugging/)).not.toBeInTheDocument();
  });
});
