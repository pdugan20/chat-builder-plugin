import { useState, useEffect, useRef } from 'react';
import { MESSAGE_TYPE } from '../../constants/messages';
import createChatQuery from '../../api/anthropic';
import { CHAT_DATA_2, CHAT_DATA_3, CHAT_DATA_4 } from '../../constants/test-data';
import { AdaptiveStreamBuffer } from '../../services/adaptive-stream-buffer';
import { JsonParserService } from '../../services/json-parser-service';

interface UseChatGenerationProps {
  anthropicKey: string;
  useTestData?: boolean;
}

interface UseChatGenerationReturn {
  loading: boolean;
  streaming: boolean;
  streamingMessages: string;
  generateChat: (params: {
    participants: string;
    maxMessages: string;
    prompt: string;
    style: string;
    includePrototype: boolean;
  }) => Promise<void>;
  cancelGeneration: () => void;
}

export default function useChatGeneration({
  anthropicKey,
  useTestData = false,
}: UseChatGenerationProps): UseChatGenerationReturn {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState('');
  const streamBufferRef = useRef<AdaptiveStreamBuffer | null>(null);
  const jsonParserRef = useRef<JsonParserService>(JsonParserService.getInstance());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data.pluginMessage;

      switch (type) {
        case MESSAGE_TYPE.BUILD_COMPLETE:
          setLoading(false);
          setStreaming(false);
          if (streamBufferRef.current) {
            streamBufferRef.current.reset();
          }
          break;

        case MESSAGE_TYPE.CANCEL_GENERATION:
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          setLoading(false);
          setStreaming(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (streamBufferRef.current) {
        streamBufferRef.current.reset();
      }
    };
  }, []);

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamBufferRef.current) {
      streamBufferRef.current.reset();
    }
    setLoading(false);
    setStreaming(false);

    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPE.CANCEL_GENERATION,
        },
      },
      '*'
    );
  };

  const generateChat = async ({
    participants,
    maxMessages,
    prompt,
    style,
    includePrototype,
  }: {
    participants: string;
    maxMessages: string;
    prompt: string;
    style: string;
    includePrototype: boolean;
  }) => {
    if (!anthropicKey) {
      parent.postMessage(
        {
          pluginMessage: {
            type: MESSAGE_TYPE.POST_API_ERROR,
            error: 'API key is required',
          },
        },
        '*'
      );
      return;
    }

    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setStreaming(true);
    setStreamingMessages('');

    try {
      if (useTestData) {
        const testDataMap = {
          '2': CHAT_DATA_2,
          '3': CHAT_DATA_3,
          '4': CHAT_DATA_4,
        };
        const data = testDataMap[participants as keyof typeof testDataMap] || CHAT_DATA_2;
        parent.postMessage(
          {
            pluginMessage: { type: MESSAGE_TYPE.BUILD_CHAT_UI, data, style, prompt, includePrototype },
          },
          '*'
        );
        return;
      }

      // Initialize adaptive stream buffer
      if (!streamBufferRef.current) {
        streamBufferRef.current = new AdaptiveStreamBuffer((content) => {
          setStreamingMessages((prev) => {
            const newText = prev + content;
            parent.postMessage(
              {
                pluginMessage: {
                  type: MESSAGE_TYPE.STREAM_UPDATE,
                  chunk: content,
                  accumulatedText: newText,
                },
              },
              '*'
            );
            return newText;
          });
        });
      }

      const response = await createChatQuery({
        apiKey: anthropicKey,
        queryInputs: { participants, maxMessages, prompt },
        onStream: (chunk) => {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Generation cancelled');
          }
          streamBufferRef.current?.append(chunk);
        },
      });

      // Flush any remaining buffered content
      streamBufferRef.current?.forceFlush();

      // Stop streaming indicator
      setStreaming(false);

      if (!response?.content?.[0]?.text) {
        parent.postMessage(
          {
            pluginMessage: {
              type: MESSAGE_TYPE.POST_API_ERROR,
              error: 'No response generated from API',
              retryable: true,
            },
          },
          '*'
        );
        return;
      }

      // Parse JSON in WebWorker if available
      try {
        const parsedData = await jsonParserRef.current.parse(response.content[0].text);

        parent.postMessage(
          {
            pluginMessage: {
              type: MESSAGE_TYPE.BUILD_CHAT_UI,
              data: parsedData,
              style,
              prompt,
              includePrototype,
            },
          },
          '*'
        );
      } catch (parseError) {
        // Fallback to plugin-side parsing
        parent.postMessage(
          {
            pluginMessage: {
              type: MESSAGE_TYPE.PARSE_AND_BUILD_CHAT,
              rawResponse: response.content[0].text,
              style,
              prompt,
              includePrototype,
            },
          },
          '*'
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Generation cancelled') {
        return;
      }

      setLoading(false);
      setStreaming(false);
      parent.postMessage(
        {
          pluginMessage: {
            type: MESSAGE_TYPE.POST_API_ERROR,
            error: error instanceof Error ? error.message : 'An error occurred while generating chat',
            retryable: true,
          },
        },
        '*'
      );
    } finally {
      abortControllerRef.current = null;
    }
  };

  return {
    loading,
    streaming,
    streamingMessages,
    generateChat,
    cancelGeneration,
  };
}
