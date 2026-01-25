import { ChatGenerationService, GenerationCallbacks } from '../chat-generation';
import { APIService } from '../api';
import { ValidationService } from '../validation';
import { PluginMessengerService } from '../plugin-messenger';
import { LoadingStateManager } from '../loading-state';
import { ChatItem } from '../../types/chat';
import createMockChatItem from '../../test-helpers';

// Mock dependencies
jest.mock('../api');
jest.mock('../validation');
jest.mock('../plugin-messenger');
jest.mock('../loading-state');

describe('ChatGenerationService', () => {
  let chatGenerationService: ChatGenerationService;
  let mockApiService: jest.Mocked<APIService>;
  let mockValidationService: jest.Mocked<ValidationService>;
  let mockMessengerService: jest.Mocked<PluginMessengerService>;
  let mockLoadingManager: jest.Mocked<LoadingStateManager>;
  let mockCallbacks: GenerationCallbacks;

  beforeEach(() => {
    mockApiService = new APIService() as jest.Mocked<APIService>;
    mockValidationService = new ValidationService() as jest.Mocked<ValidationService>;
    mockMessengerService = new PluginMessengerService() as jest.Mocked<PluginMessengerService>;
    mockLoadingManager = new LoadingStateManager() as jest.Mocked<LoadingStateManager>;

    chatGenerationService = new ChatGenerationService(
      mockApiService,
      mockValidationService,
      mockMessengerService,
      mockLoadingManager
    );

    mockCallbacks = {
      onLoadingStateChange: jest.fn(),
      onStreamingStateChange: jest.fn(),
      onMessagesUpdate: jest.fn(),
      onError: jest.fn(),
    };

    // Default mock implementations
    mockValidationService.validateApiKey = jest.fn().mockReturnValue({ valid: true });
    mockApiService.generateChat = jest.fn().mockResolvedValue(undefined);
    mockApiService.generateChatWithTestData = jest.fn().mockResolvedValue(undefined);
    mockLoadingManager.reset = jest.fn();
    mockLoadingManager.onStreamStart = jest.fn();
    mockLoadingManager.onStreamComplete = jest.fn();
    mockLoadingManager.onBuildStart = jest.fn();
    mockMessengerService.sendBuildRequest = jest.fn();
  });

  describe('generateChat with real API', () => {
    const prompt = 'Test prompt';
    const apiKey = 'sk-ant-test-key';
    const style = 'light';
    const includePrototype = true;

    it('should validate API key before generating', async () => {
      await chatGenerationService.generateChat(prompt, apiKey, style, includePrototype, false, '2', mockCallbacks);

      expect(mockValidationService.validateApiKey).toHaveBeenCalledWith(apiKey);
    });

    it('should handle invalid API key', async () => {
      mockValidationService.validateApiKey = jest.fn().mockReturnValue({
        valid: false,
        error: 'API key is required',
      });

      await chatGenerationService.generateChat(prompt, null, style, includePrototype, false, '2', mockCallbacks);

      expect(mockCallbacks.onError).toHaveBeenCalledWith('API key is required');
      expect(mockCallbacks.onLoadingStateChange).toHaveBeenCalledWith(false);
      expect(mockApiService.generateChat).not.toHaveBeenCalled();
    });

    it('should reset loading manager and start stream', async () => {
      await chatGenerationService.generateChat(prompt, apiKey, style, includePrototype, false, '2', mockCallbacks);

      expect(mockLoadingManager.reset).toHaveBeenCalled();
      expect(mockLoadingManager.onStreamStart).toHaveBeenCalled();
      expect(mockCallbacks.onLoadingStateChange).toHaveBeenCalledWith(true);
    });

    it('should call API service with correct parameters', async () => {
      await chatGenerationService.generateChat(prompt, apiKey, style, includePrototype, false, '2', mockCallbacks);

      expect(mockApiService.generateChat).toHaveBeenCalledWith(
        prompt,
        apiKey,
        expect.objectContaining({
          onProgress: expect.any(Function),
          onComplete: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('should handle API errors', async () => {
      mockApiService.generateChat = jest.fn().mockRejectedValue(new Error('API failed'));

      await chatGenerationService.generateChat(prompt, apiKey, style, includePrototype, false, '2', mockCallbacks);

      expect(mockCallbacks.onError).toHaveBeenCalledWith('API failed');
      expect(mockCallbacks.onLoadingStateChange).toHaveBeenCalledWith(false);
    });
  });

  describe('generateChat with test data', () => {
    const prompt = 'Test prompt';
    const style = 'light';
    const includePrototype = false;

    it('should skip API key validation when using test data', async () => {
      await chatGenerationService.generateChat(prompt, null, style, includePrototype, true, '3', mockCallbacks);

      expect(mockValidationService.validateApiKey).not.toHaveBeenCalled();
    });

    it('should call generateChatWithTestData with correct participants', async () => {
      await chatGenerationService.generateChat(prompt, null, style, includePrototype, true, '3', mockCallbacks);

      expect(mockApiService.generateChatWithTestData).toHaveBeenCalledWith(
        '3',
        expect.objectContaining({
          onProgress: expect.any(Function),
          onComplete: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  describe('stream callbacks', () => {
    const chatData: ChatItem[] = [createMockChatItem({ name: 'Alice', message: 'Hello' })];

    it('should forward onProgress to callbacks', async () => {
      mockApiService.generateChat = jest.fn().mockImplementation(async (_, __, streamCallbacks) => {
        streamCallbacks.onProgress(chatData);
      });

      await chatGenerationService.generateChat('Test', 'sk-ant-key', 'light', true, false, '2', mockCallbacks);

      expect(mockCallbacks.onStreamingStateChange).toHaveBeenCalledWith(true);
      expect(mockCallbacks.onMessagesUpdate).toHaveBeenCalledWith(chatData);
    });

    it('should handle onComplete and send to build', async () => {
      mockApiService.generateChat = jest.fn().mockImplementation(async (_, __, streamCallbacks) => {
        streamCallbacks.onComplete(chatData);
      });

      await chatGenerationService.generateChat('Test', 'sk-ant-key', 'light', true, false, '2', mockCallbacks);

      expect(mockCallbacks.onStreamingStateChange).toHaveBeenCalledWith(false);
      expect(mockLoadingManager.onStreamComplete).toHaveBeenCalled();
      expect(mockLoadingManager.onBuildStart).toHaveBeenCalled();
      expect(mockMessengerService.sendBuildRequest).toHaveBeenCalledWith(chatData, 'light', 'Test', true);
    });

    it('should handle stream errors', async () => {
      mockApiService.generateChat = jest.fn().mockImplementation(async (_, __, streamCallbacks) => {
        streamCallbacks.onError('Stream error');
      });

      await chatGenerationService.generateChat('Test', 'sk-ant-key', 'light', true, false, '2', mockCallbacks);

      expect(mockCallbacks.onStreamingStateChange).toHaveBeenCalledWith(false);
      expect(mockCallbacks.onLoadingStateChange).toHaveBeenCalledWith(false);
      expect(mockCallbacks.onError).toHaveBeenCalledWith('Stream error');
    });
  });
});
