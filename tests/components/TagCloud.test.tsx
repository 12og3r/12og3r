import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagCloud } from '@/components/TagCloud';

const counts = { android: 18, debugging: 9, career: 5 };

describe('TagCloud', () => {
  it('renders all tags with counts', () => {
    render(<TagCloud counts={counts} selected={[]} onToggle={() => {}} />);
    expect(screen.getByText('#android')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('#career')).toBeInTheDocument();
  });

  it('marks selected tags as active', () => {
    render(<TagCloud counts={counts} selected={['android']} onToggle={() => {}} />);
    const pill = screen.getByText('#android').closest('.tag-pill');
    expect(pill).toHaveClass('selected');
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<TagCloud counts={counts} selected={[]} onToggle={onToggle} />);
    await user.click(screen.getByText('#android'));
    expect(onToggle).toHaveBeenCalledWith('android');
  });
});
