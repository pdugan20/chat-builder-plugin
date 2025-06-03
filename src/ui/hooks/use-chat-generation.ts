import { useState, useEffect } from 'react';
import { MESSAGE_TYPE } from '../../constants/messages';
import createChatQuery from '../../api/anthropic';
import cleanAndParseJson from '../../utils/json';
import chatData from '../../constants/test-data';

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
        const data = chatData;
        parent.postMessage(
          {
            pluginMessage: { type: MESSAGE_TYPE.BUILD_CHAT_UI, data, style, prompt, includePrototype },
          },
          '*'
        );
        return;
      }

      const response = await createChatQuery({
        apiKey: anthropicKey,
        queryInputs: { participants, maxMessages, prompt },
        onStream: (chunk) => {
          setStreamingMessages((prev) => {
            const newText = prev + chunk;
            parent.postMessage(
              {
                pluginMessage: {
                  type: MESSAGE_TYPE.STREAM_UPDATE,
                  chunk,
                  accumulatedText: newText,
                },
              },
              '*'
            );
            return newText;
          });
        },
      });

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

      const data = cleanAndParseJson(response.content[0].text);
      if (!data) {
        parent.postMessage(
          {
            pluginMessage: {
              type: MESSAGE_TYPE.POST_API_ERROR,
              error: 'Failed to parse API response',
              retryable: true,
            },
          },
          '*'
        );
        return;
      }

      parent.postMessage(
        {
          pluginMessage: { type: MESSAGE_TYPE.BUILD_CHAT_UI, data, style, prompt, includePrototype },
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
