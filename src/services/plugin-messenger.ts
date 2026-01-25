import { ChatItem } from '../types/chat';
import { MESSAGE_TYPE } from '../constants/messages';

type MessageCallback = () => void;
type ErrorCallback = (error: string, retryable: boolean) => void;

// eslint-disable-next-line import/prefer-default-export
export class PluginMessengerService {
  private buildCompleteCallbacks: Set<MessageCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();

  constructor() {
    this.setupMessageListener();
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      const { type, error, retryable } = event.data.pluginMessage;

      if (type === MESSAGE_TYPE.BUILD_COMPLETE) {
        this.buildCompleteCallbacks.forEach((callback) => callback());
      }

      if (type === MESSAGE_TYPE.POST_API_ERROR) {
        this.errorCallbacks.forEach((callback) => callback(error, retryable));
      }
    });
  }

  sendBuildRequest(data: ChatItem[], style: string, prompt: string, includePrototype: boolean): void {
    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPE.BUILD_CHAT_UI,
          data,
          style,
          prompt,
          includePrototype,
        },
      },
      '*'
    );
  }

  sendParseRequest(rawResponse: string, style: string, prompt: string, includePrototype: boolean): void {
    parent.postMessage(
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
  }

  sendKeyUpdate(apiKey: string): void {
    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPE.UPDATE_ANTHROPIC_KEY,
          apiKey,
        },
      },
      '*'
    );
  }

  requestReload(): void {
    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPE.RELOAD,
        },
      },
      '*'
    );
  }

  onBuildComplete(callback: MessageCallback): () => void {
    this.buildCompleteCallbacks.add(callback);
    return () => {
      this.buildCompleteCallbacks.delete(callback);
    };
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  dispose(): void {
    this.buildCompleteCallbacks.clear();
    this.errorCallbacks.clear();
  }
}
