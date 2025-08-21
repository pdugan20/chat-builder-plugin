import { useState, useEffect } from 'react';
import { MESSAGE_TYPE } from '../../constants/messages';
import createChatQuery from '../../api/anthropic';
import { CHAT_DATA_2, CHAT_DATA_3, CHAT_DATA_4 } from '../../constants/test-data';

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
}

export default function useChatGeneration({
  anthropicKey,
  useTestData = false,
}: UseChatGenerationProps): UseChatGenerationReturn {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data.pluginMessage;

      if (type === MESSAGE_TYPE.BUILD_COMPLETE) {
        setLoading(false);
        setStreaming(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

      // Use a buffer to batch streaming updates
      let streamBuffer = '';
      let bufferTimer: ReturnType<typeof setTimeout> | null = null;

      const response = await createChatQuery({
        apiKey: anthropicKey,
        queryInputs: { participants, maxMessages, prompt },
        onStream: (chunk) => {
          streamBuffer += chunk;

          // Batch updates every 100ms to reduce UI thread blocking
          if (!bufferTimer) {
            bufferTimer = setTimeout(() => {
              setStreamingMessages((prev) => {
                const newText = prev + streamBuffer;
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: MESSAGE_TYPE.STREAM_UPDATE,
                      chunk: streamBuffer,
                      accumulatedText: newText,
                    },
                  },
                  '*'
                );
                streamBuffer = '';
                bufferTimer = null;
                return newText;
              });
            }, 100);
          }
        },
      });

      // Flush any remaining buffered content
      if (bufferTimer) {
        clearTimeout(bufferTimer);
        if (streamBuffer) {
          setStreamingMessages((prev) => prev + streamBuffer);
        }
      }

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

      // Send raw response to plugin for parsing to avoid blocking UI thread
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
    } catch (error) {
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
    }
  };

  return {
    loading,
    streaming,
    streamingMessages,
    generateChat,
  };
}
