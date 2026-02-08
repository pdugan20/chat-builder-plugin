import { PluginMessengerService } from '../plugin-messenger';
import { MESSAGE_TYPE } from '../../constants/messages';
import { ChatItem } from '../../types/chat';
import createMockChatItem from '../../test/test-helpers';

describe('PluginMessengerService', () => {
  let messengerService: PluginMessengerService;
  let postMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    postMessageSpy = jest.spyOn(parent, 'postMessage');
    messengerService = new PluginMessengerService();
  });

  afterEach(() => {
    messengerService.dispose();
    postMessageSpy.mockRestore();
  });

  describe('sendBuildRequest', () => {
    it('should send BUILD_CHAT_UI message with correct format', () => {
      const chatData: ChatItem[] = [createMockChatItem({ name: 'Alice', message: 'Hello' })];
      const style = 'light';
      const prompt = 'Test prompt';
      const includePrototype = true;

      messengerService.sendBuildRequest(chatData, style, prompt, includePrototype);

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          pluginMessage: {
            type: MESSAGE_TYPE.BUILD_CHAT_UI,
            data: chatData,
            style,
            prompt,
            includePrototype,
          },
        },
        '*'
      );
    });
  });

  describe('sendParseRequest', () => {
    it('should send PARSE_AND_BUILD_CHAT message with correct format', () => {
      const rawResponse = '{"chat": "data"}';
      const style = 'dark';
      const prompt = 'Test prompt';
      const includePrototype = false;

      messengerService.sendParseRequest(rawResponse, style, prompt, includePrototype);

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          pluginMessage: {
            type: MESSAGE_TYPE.PARSE_AND_BUILD_CHAT,
            rawResponse,
            style,
            prompt,
            includePrototype,
          },
        },
        '*'
      );
    });
  });

  describe('sendKeyUpdate', () => {
    it('should send UPDATE_ANTHROPIC_KEY message with correct format', () => {
      const apiKey = 'sk-ant-test-key';

      messengerService.sendKeyUpdate(apiKey);

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          pluginMessage: {
            type: MESSAGE_TYPE.UPDATE_ANTHROPIC_KEY,
            apiKey,
          },
        },
        '*'
      );
    });
  });

  describe('requestReload', () => {
    it('should send RELOAD message with correct format', () => {
      messengerService.requestReload();

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          pluginMessage: {
            type: MESSAGE_TYPE.RELOAD,
          },
        },
        '*'
      );
    });
  });

  describe('onBuildComplete', () => {
    it('should register callback and execute on BUILD_COMPLETE message', () => {
      const callback = jest.fn();
      messengerService.onBuildComplete(callback);

      // Simulate BUILD_COMPLETE message
      const event = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MESSAGE_TYPE.BUILD_COMPLETE,
          },
        },
      });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function that removes callback', () => {
      const callback = jest.fn();
      const unsubscribe = messengerService.onBuildComplete(callback);

      // Unsubscribe
      unsubscribe();

      // Simulate BUILD_COMPLETE message
      const event = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MESSAGE_TYPE.BUILD_COMPLETE,
          },
        },
      });
      window.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should execute multiple callbacks when registered', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      messengerService.onBuildComplete(callback1);
      messengerService.onBuildComplete(callback2);

      // Simulate BUILD_COMPLETE message
      const event = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MESSAGE_TYPE.BUILD_COMPLETE,
          },
        },
      });
      window.dispatchEvent(event);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('onError', () => {
    it('should register callback and execute on POST_API_ERROR message', () => {
      const callback = jest.fn();
      messengerService.onError(callback);

      // Simulate POST_API_ERROR message
      const event = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MESSAGE_TYPE.POST_API_ERROR,
            error: 'Test error',
            retryable: true,
          },
        },
      });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith('Test error', true);
    });

    it('should return unsubscribe function that removes callback', () => {
      const callback = jest.fn();
      const unsubscribe = messengerService.onError(callback);

      // Unsubscribe
      unsubscribe();

      // Simulate POST_API_ERROR message
      const event = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MESSAGE_TYPE.POST_API_ERROR,
            error: 'Test error',
            retryable: false,
          },
        },
      });
      window.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should clear all callbacks', () => {
      const buildCallback = jest.fn();
      const errorCallback = jest.fn();

      messengerService.onBuildComplete(buildCallback);
      messengerService.onError(errorCallback);

      messengerService.dispose();

      // Simulate messages
      const buildEvent = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MESSAGE_TYPE.BUILD_COMPLETE,
          },
        },
      });
      const errorEvent = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MESSAGE_TYPE.POST_API_ERROR,
            error: 'Test error',
            retryable: true,
          },
        },
      });

      window.dispatchEvent(buildEvent);
      window.dispatchEvent(errorEvent);

      expect(buildCallback).not.toHaveBeenCalled();
      expect(errorCallback).not.toHaveBeenCalled();
    });
  });
});
