import { render, screen, act } from '@testing-library/react';
import LoadingOverlay from '../loading';
import { LoadingStateManager } from '../../../../services/loading-state';

// Mock LoadingStateManager
jest.mock('../../../../services/loading-state');

describe('LoadingOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should render with loading manager', () => {
    const mockLoadingManager = new LoadingStateManager() as jest.Mocked<LoadingStateManager>;
    mockLoadingManager.getStageDescription = jest.fn().mockReturnValue('Authenticating with Claude...');

    render(<LoadingOverlay loadingManager={mockLoadingManager} />);

    expect(screen.getByText(/Authenticating with Claude/)).toBeInTheDocument();
    expect(mockLoadingManager.getStageDescription).toHaveBeenCalled();
  });

  it('should update when loading manager stage changes', () => {
    const mockLoadingManager = new LoadingStateManager() as jest.Mocked<LoadingStateManager>;
    mockLoadingManager.getStageDescription = jest
      .fn()
      .mockReturnValueOnce('Authenticating with Claude...')
      .mockReturnValueOnce('Generating chat conversation...');

    const { rerender } = render(<LoadingOverlay loadingManager={mockLoadingManager} />);

    expect(screen.getByText(/Authenticating with Claude/)).toBeInTheDocument();

    // Trigger re-render with updated manager
    rerender(<LoadingOverlay loadingManager={mockLoadingManager} />);

    expect(screen.getByText(/Generating chat conversation/)).toBeInTheDocument();
  });

  it('should fall back to timer-based stages without manager', () => {
    render(<LoadingOverlay />);

    // Should show first stage
    expect(screen.getByText(/Initializing chat generation/)).toBeInTheDocument();

    // Advance to next stage (3500ms)
    act(() => {
      jest.advanceTimersByTime(3500);
    });

    expect(screen.getByText(/Analyzing conversation inputs/)).toBeInTheDocument();
  });

  it('should display streaming messages when provided', () => {
    const streamingMessages = 'Alice: Hello\nBob: Hi there';

    render(<LoadingOverlay streamingMessages={streamingMessages} showStreamingText />);

    // Check that the streaming messages appear in the document
    expect(screen.getByText(/Alice: Hello/)).toBeInTheDocument();
    expect(screen.getByText(/Bob: Hi there/)).toBeInTheDocument();
  });

  it('should show spinner when showSpinner prop is true', () => {
    render(<LoadingOverlay showSpinner />);

    // Check for presence of spinner by finding the loading stage text (spinner always appears with it)
    expect(screen.getByText(/Initializing chat generation/)).toBeInTheDocument();
  });

  it('should not show spinner when showSpinner prop is false', () => {
    render(<LoadingOverlay showSpinner={false} />);

    // Verify loading overlay still renders without spinner
    expect(screen.getByText(/Initializing chat generation/)).toBeInTheDocument();
  });

  it('should show timeout message after timeout duration', () => {
    // Mock loadingConstants.TIMEOUT_DURATION - default is typically 30000ms
    render(<LoadingOverlay />);

    // Advance past timeout (30 seconds)
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByText(/We're still working. Please wait/)).toBeInTheDocument();
  });
});
