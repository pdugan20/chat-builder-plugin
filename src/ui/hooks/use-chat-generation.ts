import { useState } from 'react';
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
  generateChat: (params: { participants: string; maxMessages: string; prompt: string; style: string }) => Promise<void>;
}

export default function useChatGeneration({
  anthropicKey,
  useTestData = false,
}: UseChatGenerationProps): UseChatGenerationReturn {
  const [loading, setLoading] = useState(false);

  const generateChat = async ({
    participants,
    maxMessages,
    prompt,
    style,
  }: {
    participants: string;
    maxMessages: string;
    prompt: string;
    style: string;
  }) => {
    setLoading(true);

    try {
      if (useTestData) {
        const data = chatData;
        parent.postMessage(
          {
            pluginMessage: { type: MESSAGE_TYPE.BUILD_CHAT_UI, data, style, prompt },
          },
          '*'
        );
        return;
      }

      const response = await createChatQuery({
        apiKey: anthropicKey,
        queryInputs: { participants, maxMessages, prompt },
      });

      if (!response?.content?.[0]?.text) {
        return;
      }

      const data = cleanAndParseJson(response.content[0].text);
      parent.postMessage(
        {
          pluginMessage: { type: MESSAGE_TYPE.BUILD_CHAT_UI, data, style, prompt },
        },
        '*'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateChat,
  };
}
