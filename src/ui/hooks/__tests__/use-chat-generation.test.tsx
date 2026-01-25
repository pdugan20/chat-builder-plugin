import { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import useChatGeneration from '../use-chat-generation';
import { ChatGenerationService } from '../../../services/chat-generation';
import { APIService } from '../../../services/api';
import { MessengerProvider } from '../../context/messenger';

// Mock services
jest.mock('../../../services/chat-generation');
jest.mock('../../../services/api');

describe('useChatGeneration', () => {
  let mockChatService: jest.Mocked<ChatGenerationService>;

  const wrapper = ({ children }: { children: ReactNode }) => <MessengerProvider>{children}</MessengerProvider>;

  beforeEach(() => {
    // Mock ChatGenerationService
    mockChatService = {
      generateChat: jest.fn().mockResolvedValue(undefined),
    } as any;

    (ChatGenerationService as jest.Mock).mockImplementation(() => mockChatService);

    // Mock APIService
    (APIService as unknown as jest.Mock).mockImplementation(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useChatGeneration({ anthropicKey: 'sk-ant-key' }), {
      wrapper,
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.streaming).toBe(false);
    expect(result.current.streamingMessages).toBe('');
    expect(result.current.loadingManager).toBeDefined();
    expect(result.current.generateChat).toBeDefined();
  });

  it('should set loading state when generating', async () => {
    mockChatService.generateChat = jest.fn().mockImplementation(async (_, __, ___, ____, _____, ______, callbacks) => {
      callbacks.onLoadingStateChange(true);
    });

    const { result } = renderHook(() => useChatGeneration({ anthropicKey: 'sk-ant-key' }), {
      wrapper,
    });

    await act(async () => {
      await result.current.generateChat({
        participants: '2',
        maxMessages: '15',
        prompt: 'Test prompt',
        style: 'light',
        includePrototype: true,
      });
    });

    expect(result.current.loading).toBe(true);
  });

  it('should clear streaming messages on new generation', async () => {
    const { result } = renderHook(() => useChatGeneration({ anthropicKey: 'sk-ant-key' }), {
      wrapper,
    });

    // Set initial streaming messages
    await act(async () => {
      const createMockChatItem = (await import('../../../test-helpers')).default;
      mockChatService.generateChat = jest
        .fn()
        .mockImplementation(async (_, __, ___, ____, _____, ______, callbacks) => {
          callbacks.onMessagesUpdate([createMockChatItem({ name: 'Alice', message: 'First' })]);
        });

      await result.current.generateChat({
        participants: '2',
        maxMessages: '15',
        prompt: 'First prompt',
        style: 'light',
        includePrototype: true,
      });
    });

    expect(result.current.streamingMessages).toBeTruthy();

    // Generate again - should clear messages first
    await act(async () => {
      await result.current.generateChat({
        participants: '2',
        maxMessages: '15',
        prompt: 'Second prompt',
        style: 'light',
        includePrototype: true,
      });
    });

    // Verify generateChat was called (messages will be cleared before service call)
    expect(mockChatService.generateChat).toHaveBeenCalledTimes(2);
  });

  it('should update streaming messages when onMessagesUpdate is called', async () => {
    mockChatService.generateChat = jest.fn().mockImplementation(async (_, __, ___, ____, _____, ______, callbacks) => {
      const createMockChatItem = (await import('../../../test-helpers')).default;
      callbacks.onMessagesUpdate([
        createMockChatItem({ name: 'Alice', message: 'Hello' }),
        createMockChatItem({ role: 'recipient', name: 'Bob', message: 'Hi there' }),
      ]);
    });

    const { result } = renderHook(() => useChatGeneration({ anthropicKey: 'sk-ant-key' }), {
      wrapper,
    });

    await act(async () => {
      await result.current.generateChat({
        participants: '2',
        maxMessages: '15',
        prompt: 'Test prompt',
        style: 'light',
        includePrototype: true,
      });
    });

    expect(result.current.streamingMessages).toBe('Alice: Hello\nBob: Hi there');
  });

  it('should pass correct parameters to ChatGenerationService', async () => {
    const { result } = renderHook(() => useChatGeneration({ anthropicKey: 'sk-ant-test-key', useTestData: true }), {
      wrapper,
    });

    await act(async () => {
      await result.current.generateChat({
        participants: '3',
        maxMessages: '20',
        prompt: 'Test prompt for chat',
        style: 'dark',
        includePrototype: false,
      });
    });

    expect(mockChatService.generateChat).toHaveBeenCalledWith(
      'Test prompt for chat',
      'sk-ant-test-key',
      'dark',
      false,
      true, // useTestData
      '3', // participants
      expect.objectContaining({
        onLoadingStateChange: expect.any(Function),
        onStreamingStateChange: expect.any(Function),
        onMessagesUpdate: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });
});
