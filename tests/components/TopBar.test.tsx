import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { I18nProvider } from '@/hooks/useI18n';

function setup(props: React.ComponentProps<typeof TopBar> = {}, initialPath = '/en') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <I18nProvider>
        <TopBar {...props} />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('TopBar', () => {
  it('renders brand', () => {
    setup();
    expect(screen.getByText(/Roger's Space/i)).toBeInTheDocument();
  });

  it('hides ~ on the home page itself (you are already home)', () => {
    setup();
    expect(screen.queryByText('~')).not.toBeInTheDocument();
    expect(screen.queryByText('/about')).not.toBeInTheDocument();
  });

  it('shows ~ on non-home pages', () => {
    setup({}, '/en/posts/abc');
    expect(screen.getByText('~')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    setup();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('renders article filename with ~ and path separator on non-home pages', () => {
    setup({ articleFilename: 'No_Farewell_Motiff.md' }, '/en/posts/abc');
    expect(screen.getByText('~')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('No_Farewell_Motiff.md')).toBeInTheDocument();
  });

  it('renders skip button and triggers onSkip when clicked', async () => {
    const onSkip = vi.fn();
    const user = userEvent.setup();
    setup({ onSkip });
    await user.click(screen.getByText(/SKIP/i));
    expect(onSkip).toHaveBeenCalled();
  });

  it('hides skip button when onSkip is not provided', () => {
    setup();
    expect(screen.queryByText(/SKIP/i)).not.toBeInTheDocument();
  });
});
