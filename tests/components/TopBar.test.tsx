import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { I18nProvider } from '@/hooks/useI18n';

function setup(initialPath = '/en') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <I18nProvider>
        <TopBar />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('TopBar', () => {
  it('renders brand', () => {
    setup();
    expect(screen.getByText(/Roger's Space/i)).toBeInTheDocument();
  });

  it('renders home and about nav links', () => {
    setup();
    expect(screen.getByText('~')).toBeInTheDocument();
    expect(screen.getByText('/about')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    setup();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });
});
