import { ChatItem } from '../types/chat';
import { APIService, StreamCallbacks } from './api';
import { ValidationService } from './validation';
import { PluginMessengerService } from './plugin-messenger';
import { LoadingStateManager } from './loading-state';

export interface GenerationCallbacks {
  onLoadingStateChange: (loading: boolean) => void;
  onStreamingStateChange: (streaming: boolean) => void;
  onMessagesUpdate: (messages: ChatItem[]) => void;
  onError: (error: string) => void;
}

// eslint-disable-next-line import/prefer-default-export
export class ChatGenerationService {
  constructor(
    private apiService: APIService,
    private validationService: ValidationService,
    private messengerService: PluginMessengerService,
    private loadingManager: LoadingStateManager
  ) {}

  async generateChat(
    prompt: string,
    apiKey: string | null,
    style: string,
    includePrototype: boolean,
    useTestData: boolean,
    participants: string,
    callbacks: GenerationCallbacks
  ): Promise<void> {
    // Reset loading state
    this.loadingManager.reset();
    callbacks.onLoadingStateChange(true);
    callbacks.onStreamingStateChange(false);

    // Validate API key unless using test data
    if (!useTestData) {
      const keyValidation = this.validationService.validateApiKey(apiKey);
      if (!keyValidation.valid) {
        callbacks.onError(keyValidation.error || 'Invalid API key');
        callbacks.onLoadingStateChange(false);
        return;
      }
    }

    // Setup stream callbacks
    const streamCallbacks: StreamCallbacks = {
      onProgress: (messages: ChatItem[]) => {
        callbacks.onStreamingStateChange(true);
        callbacks.onMessagesUpdate(messages);
      },
      onComplete: (messages: ChatItem[]) => {
        callbacks.onStreamingStateChange(false);
        this.loadingManager.onStreamComplete();
        this.sendToBuild(messages, style, prompt, includePrototype);
      },
      onError: (error: string) => {
        callbacks.onStreamingStateChange(false);
        callbacks.onLoadingStateChange(false);
        callbacks.onError(error);
      },
    };

    // Generate chat
    this.loadingManager.onStreamStart();

    try {
      if (useTestData) {
        await this.apiService.generateChatWithTestData(participants, streamCallbacks);
      } else {
        await this.apiService.generateChat(prompt, apiKey || '', streamCallbacks);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      callbacks.onError(errorMessage);
      callbacks.onLoadingStateChange(false);
    }
  }

  private sendToBuild(messages: ChatItem[], style: string, prompt: string, includePrototype: boolean): void {
    this.loadingManager.onBuildStart();
    this.messengerService.sendBuildRequest(messages, style, prompt, includePrototype);
  }
}
