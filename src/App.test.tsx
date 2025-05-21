import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fullscreen APIs
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    value: vi.fn(),
  });
});

describe('Monitor Fill Light Controls', () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('shows controls by default', () => {
    render(<App animationDuration={0} />);
    expect(screen.getByText(/Monitor Fill Light/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go Fullscreen/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Color Temperature/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Brightness/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /K\)/i }).length).toBeGreaterThan(0); // Presets
  });

  it('auto-hides controls after mouse leaves controls', async () => {
    render(<App animationDuration={0} />);
    const controls = screen.getByText(/Monitor Fill Light/i).closest('.controls');
    // Simulate mouse leave
    await act(async () => {
      controls && fireEvent.mouseLeave(controls);
    });
    await new Promise(res => setTimeout(res, 1000));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Show controls/i })).toBeInTheDocument();
    });
  });

  it('restores controls when Show Controls is clicked', async () => {
    render(<App animationDuration={0} />);
    const controls = screen.getByText(/Monitor Fill Light/i).closest('.controls');
    await act(async () => {
      controls && fireEvent.mouseLeave(controls);
    });
    await new Promise(res => setTimeout(res, 1000));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Show controls/i })).toBeInTheDocument();
    });
    const showBtn = screen.getByRole('button', { name: /Show controls/i });
    await act(async () => { await user.click(showBtn); });
    expect(screen.getByText(/Monitor Fill Light/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go Fullscreen/i })).toBeInTheDocument();
  });

  it('does not auto-hide controls while hovered', async () => {
    render(<App animationDuration={0} />);
    const controls = screen.getByText(/Monitor Fill Light/i).closest('.controls');
    await act(async () => {
      controls && fireEvent.mouseEnter(controls);
    });
    await new Promise(res => setTimeout(res, 1500));
    expect(screen.queryByRole('button', { name: /Show controls/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Monitor Fill Light/i)).toBeInTheDocument();
  });
});
