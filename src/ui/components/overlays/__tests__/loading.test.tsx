import { render, screen, act } from '@testing-library/react';
import LoadingOverlay from '../loading';

describe('LoadingOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should show first loading stage on render', () => {
    render(<LoadingOverlay />);

    expect(screen.getByText(/Initializing chat generation/)).toBeInTheDocument();
  });

  it('should cycle through loading stages on timer', () => {
    render(<LoadingOverlay />);

    expect(screen.getByText(/Initializing chat generation/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3500);
    });

    expect(screen.getByText(/Analyzing conversation inputs/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3500);
    });

    expect(screen.getByText(/Authoring messages and reactions/)).toBeInTheDocument();
  });

  it('should display streaming messages when provided', () => {
    const streamingMessages = 'Alice: Hello\nBob: Hi there';

    render(<LoadingOverlay streamingMessages={streamingMessages} showStreamingText />);

    expect(screen.getByText(/Alice: Hello/)).toBeInTheDocument();
    expect(screen.getByText(/Bob: Hi there/)).toBeInTheDocument();
  });

  it('should show spinner when showSpinner prop is true', () => {
    render(<LoadingOverlay showSpinner />);

    expect(screen.getByText(/Initializing chat generation/)).toBeInTheDocument();
  });

  it('should not show spinner when showSpinner prop is false', () => {
    render(<LoadingOverlay showSpinner={false} />);

    expect(screen.getByText(/Initializing chat generation/)).toBeInTheDocument();
  });

  it('should show timeout message after timeout duration', () => {
    render(<LoadingOverlay />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByText(/We're still working. Please wait/)).toBeInTheDocument();
  });
});
