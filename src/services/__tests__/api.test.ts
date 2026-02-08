import { APIService, StreamCallbacks } from '../api';
import createChatQuery from '../../api/anthropic';
import { ChatItem } from '../../types/chat';
import { CHAT_DATA_2, CHAT_DATA_3, CHAT_DATA_4 } from '../../constants/test-data';
import createMockChatItem from '../../test/test-helpers';

// Mock the anthropic API
jest.mock('../../api/anthropic');

describe('APIService', () => {
  let apiService: APIService;
  let mockCallbacks: StreamCallbacks;

  beforeEach(() => {
    apiService = new APIService();
    mockCallbacks = {
      onProgress: jest.fn(),
      onComplete: jest.fn(),
      onError: jest.fn(),
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('generateChat', () => {
    it('should call API with correct parameters', async () => {
      const mockResponse = {
        content: [{ text: JSON.stringify([createMockChatItem()]) }],
      };
      (createChatQuery as jest.Mock).mockResolvedValue(mockResponse);

      const promise = apiService.generateChat('Test prompt', 'sk-ant-key', mockCallbacks);

      // Fast-forward timers to flush buffer
      jest.runAllTimers();
      await promise;

      expect(createChatQuery).toHaveBeenCalledWith({
        apiKey: 'sk-ant-key',
        queryInputs: { prompt: 'Test prompt', participants: '2', maxMessages: '15' },
        onStream: expect.any(Function),
      });
    });

    it('should extract JSON from stream and call onProgress', async () => {
      const chatData: ChatItem[] = [
        createMockChatItem({ name: 'Alice', message: 'Hello' }),
        createMockChatItem({ role: 'recipient', name: 'Bob', message: 'Hi there' }),
      ];
      const mockResponse = {
        content: [{ text: JSON.stringify(chatData) }],
      };

      let onStreamCallback: ((chunk: string) => void) | undefined;
      (createChatQuery as jest.Mock).mockImplementation(({ onStream }) => {
        onStreamCallback = onStream;
        return Promise.resolve(mockResponse);
      });

      const promise = apiService.generateChat('Test prompt', 'sk-ant-key', mockCallbacks);

      // Simulate streaming chunks
      if (onStreamCallback) {
        onStreamCallback('[');
        onStreamCallback(JSON.stringify(chatData[0]));
        onStreamCallback(',');
        onStreamCallback(JSON.stringify(chatData[1]));
        onStreamCallback(']');
      }

      // Fast-forward buffer timeout
      jest.runAllTimers();
      await promise;

      expect(mockCallbacks.onProgress).toHaveBeenCalled();
      expect(mockCallbacks.onComplete).toHaveBeenCalledWith(chatData);
    });

    it('should handle API errors', async () => {
      const error = new Error('API request failed');
      (createChatQuery as jest.Mock).mockRejectedValue(error);

      await apiService.generateChat('Test prompt', 'sk-ant-key', mockCallbacks);

      expect(mockCallbacks.onError).toHaveBeenCalledWith('API request failed');
    });

    it('should handle missing response content', async () => {
      (createChatQuery as jest.Mock).mockResolvedValue({});

      const promise = apiService.generateChat('Test prompt', 'sk-ant-key', mockCallbacks);
      jest.runAllTimers();
      await promise;

      expect(mockCallbacks.onError).toHaveBeenCalledWith('No response generated from API');
    });

    it('should batch streaming updates with 100ms interval', async () => {
      const chatData: ChatItem[] = [createMockChatItem({ name: 'Alice', message: 'Hello' })];
      const mockResponse = {
        content: [{ text: JSON.stringify(chatData) }],
      };

      let onStreamCallback: ((chunk: string) => void) | undefined;
      (createChatQuery as jest.Mock).mockImplementation(({ onStream }) => {
        onStreamCallback = onStream;
        return Promise.resolve(mockResponse);
      });

      const promise = apiService.generateChat('Test prompt', 'sk-ant-key', mockCallbacks);

      // Simulate multiple chunks arriving quickly
      if (onStreamCallback) {
        onStreamCallback('[');
        onStreamCallback('{');
        onStreamCallback('"role"');
        onStreamCallback(':');
        onStreamCallback('"user"');
      }

      // Should not have called onProgress yet (buffering)
      expect(mockCallbacks.onProgress).not.toHaveBeenCalled();

      // Advance timer by buffer interval
      jest.advanceTimersByTime(100);

      // Should still not emit (invalid JSON)
      expect(mockCallbacks.onProgress).not.toHaveBeenCalled();

      // Complete the JSON
      if (onStreamCallback) {
        onStreamCallback(',');
        onStreamCallback('"message":"Hello"');
        onStreamCallback(',');
        onStreamCallback('"name":"Alice"');
        onStreamCallback('}');
        onStreamCallback(']');
      }

      // Advance timer again
      jest.advanceTimersByTime(100);

      // Now should have emitted
      expect(mockCallbacks.onProgress).toHaveBeenCalled();

      jest.runAllTimers();
      await promise;
    });

    it('should not emit duplicate progress updates', async () => {
      const chatData: ChatItem[] = [createMockChatItem({ name: 'Alice', message: 'Hello' })];
      const mockResponse = {
        content: [{ text: JSON.stringify(chatData) }],
      };

      let onStreamCallback: ((chunk: string) => void) | undefined;
      (createChatQuery as jest.Mock).mockImplementation(({ onStream }) => {
        onStreamCallback = onStream;
        return Promise.resolve(mockResponse);
      });

      const promise = apiService.generateChat('Test prompt', 'sk-ant-key', mockCallbacks);

      // Simulate complete JSON in one chunk
      if (onStreamCallback) {
        onStreamCallback(JSON.stringify(chatData));
      }

      jest.advanceTimersByTime(100);
      const firstCallCount = (mockCallbacks.onProgress as jest.Mock).mock.calls.length;

      // Send same data again (shouldn't emit)
      if (onStreamCallback) {
        onStreamCallback('');
      }

      jest.advanceTimersByTime(100);
      const secondCallCount = (mockCallbacks.onProgress as jest.Mock).mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);

      jest.runAllTimers();
      await promise;
    });
  });

  describe('generateChatWithTestData', () => {
    it('should return test data for 2 participants', async () => {
      const promise = apiService.generateChatWithTestData('2', mockCallbacks);
      await jest.runAllTimersAsync();
      await promise;

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(CHAT_DATA_2);
      expect(mockCallbacks.onComplete).toHaveBeenCalledWith(CHAT_DATA_2);
    });

    it('should return test data for 3 participants', async () => {
      const promise = apiService.generateChatWithTestData('3', mockCallbacks);
      await jest.runAllTimersAsync();
      await promise;

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(CHAT_DATA_3);
      expect(mockCallbacks.onComplete).toHaveBeenCalledWith(CHAT_DATA_3);
    });

    it('should return test data for 4 participants', async () => {
      const promise = apiService.generateChatWithTestData('4', mockCallbacks);
      await jest.runAllTimersAsync();
      await promise;

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(CHAT_DATA_4);
      expect(mockCallbacks.onComplete).toHaveBeenCalledWith(CHAT_DATA_4);
    });

    it('should default to 2 participants for invalid input', async () => {
      const promise = apiService.generateChatWithTestData('5', mockCallbacks);
      await jest.runAllTimersAsync();
      await promise;

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(CHAT_DATA_2);
      expect(mockCallbacks.onComplete).toHaveBeenCalledWith(CHAT_DATA_2);
    });

    it('should simulate delay with setTimeout', async () => {
      const promise = apiService.generateChatWithTestData('2', mockCallbacks);

      // Should not have called callbacks yet
      expect(mockCallbacks.onProgress).not.toHaveBeenCalled();

      // Advance by first delay (500ms)
      await jest.advanceTimersByTimeAsync(500);
      expect(mockCallbacks.onProgress).toHaveBeenCalled();

      // Advance by second delay (500ms)
      await jest.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockCallbacks.onComplete).toHaveBeenCalled();
    });

    it('should handle errors in test data mode', async () => {
      // Force an error by providing invalid callbacks
      const errorCallbacks = {
        ...mockCallbacks,
        onProgress: jest.fn(() => {
          throw new Error('Test error');
        }),
      };

      const promise = apiService.generateChatWithTestData('2', errorCallbacks);
      await jest.runAllTimersAsync();
      await promise;

      expect(errorCallbacks.onError).toHaveBeenCalledWith('Test error');
    });
  });
});
