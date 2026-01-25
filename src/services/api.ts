import { ChatItem } from '../types/chat';
import createChatQuery from '../api/anthropic';
import { CHAT_DATA_2, CHAT_DATA_3, CHAT_DATA_4 } from '../constants/test-data';

export interface StreamCallbacks {
  onProgress: (messages: ChatItem[]) => void;
  onComplete: (messages: ChatItem[]) => void;
  onError: (error: string) => void;
}

// eslint-disable-next-line import/prefer-default-export
export class APIService {
  private static readonly BUFFER_INTERVAL = 100; // ms
  private streamBuffer = '';
  private bufferTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastEmittedMessages: ChatItem[] = [];

  async generateChat(prompt: string, apiKey: string, callbacks: StreamCallbacks): Promise<void> {
    this.resetBuffer();

    try {
      const response = await createChatQuery({
        apiKey,
        queryInputs: { prompt, participants: '2', maxMessages: '15' },
        onStream: (chunk: string) => {
          this.handleStreamChunk(chunk, callbacks);
        },
      });

      // Final flush
      this.flushBuffer(callbacks, true);

      // Check if we got a valid response
      if (!response?.content?.[0]?.text) {
        callbacks.onError('No response generated from API');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      callbacks.onError(errorMessage);
    }
  }

  async generateChatWithTestData(participants: string, callbacks: StreamCallbacks): Promise<void> {
    this.resetBuffer();

    try {
      // Simulate streaming delay
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      const testDataMap: Record<string, readonly ChatItem[]> = {
        '2': CHAT_DATA_2,
        '3': CHAT_DATA_3,
        '4': CHAT_DATA_4,
      };
      const testData = (testDataMap[participants] || CHAT_DATA_2) as ChatItem[];

      callbacks.onProgress(testData);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      callbacks.onComplete(testData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test data error';
      callbacks.onError(errorMessage);
    }
  }

  private handleStreamChunk(chunk: string, callbacks: StreamCallbacks): void {
    this.streamBuffer += chunk;

    // Clear existing timeout
    if (this.bufferTimeoutId) {
      clearTimeout(this.bufferTimeoutId);
    }

    // Set new timeout for batch processing
    this.bufferTimeoutId = setTimeout(() => {
      this.flushBuffer(callbacks, false);
    }, APIService.BUFFER_INTERVAL);
  }

  private flushBuffer(callbacks: StreamCallbacks, isFinal: boolean): void {
    const extracted = this.extractJsonFromStream(this.streamBuffer);

    if (extracted) {
      // Only emit if messages have changed
      if (JSON.stringify(extracted) !== JSON.stringify(this.lastEmittedMessages)) {
        this.lastEmittedMessages = extracted;
        callbacks.onProgress(extracted);
      }

      if (isFinal) {
        callbacks.onComplete(extracted);
      }
    }
  }

  private extractJsonFromStream(text: string): ChatItem[] | null {
    // Look for JSON array pattern
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Invalid JSON, continue buffering
    }

    return null;
  }

  private resetBuffer(): void {
    this.streamBuffer = '';
    this.lastEmittedMessages = [];
    if (this.bufferTimeoutId) {
      clearTimeout(this.bufferTimeoutId);
      this.bufferTimeoutId = null;
    }
  }
}
