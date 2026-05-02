import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangSwitcher } from '@/components/LangSwitcher';
import { I18nProvider, useI18n } from '@/hooks/useI18n';

function CurrentLang() {
  const { lang } = useI18n();
  return <span data-testid="lang">{lang}</span>;
}

describe('LangSwitcher', () => {
  it('renders both language pills with current highlighted', () => {
    render(
      <I18nProvider>
        <LangSwitcher />
      </I18nProvider>
    );
    expect(screen.getByText('EN')).toHaveClass('active');
    expect(screen.getByText('中文')).not.toHaveClass('active');
  });

  it('switches language on click', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <LangSwitcher />
        <CurrentLang />
      </I18nProvider>
    );
    await user.click(screen.getByText('中文'));
    expect(screen.getByTestId('lang').textContent).toBe('zh');
  });
});
