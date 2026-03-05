import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ChatItem } from '../../types/chat';
import { ChatGenerationService } from '../../services/chat-generation';
import { APIService } from '../../services/api';
import ValidationService from '../../services/validation';
import LoadingStateManager from '../../services/loading-state';
import { useMessenger } from '../context/messenger';

interface UseChatGenerationProps {
  anthropicKey: string;
  useTestData?: boolean;
}

interface UseChatGenerationReturn {
  loading: boolean;
  streaming: boolean;
  streamingMessages: string;
  loadingManager: LoadingStateManager;
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

  const messenger = useMessenger();

  // Create services once (stable across re-renders)
  const services = useMemo(
    () => ({
      apiService: new APIService(),
      validationService: new ValidationService(),
      loadingManager: new LoadingStateManager(),
    }),
    []
  );

  const chatService = useRef(
    new ChatGenerationService(services.apiService, services.validationService, messenger, services.loadingManager)
  );

  // Listen for build complete messages
  useEffect(() => {
    const unsubscribe = messenger.onBuildComplete(() => {
      setLoading(false);
      setStreaming(false);
    });

    return unsubscribe;
  }, [messenger]);

  const generateChat = useCallback(
    async ({
      participants,
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
      // Clear previous streaming messages
      setStreamingMessages('');

      await chatService.current.generateChat(prompt, anthropicKey, style, includePrototype, useTestData, participants, {
        onLoadingStateChange: setLoading,
        onStreamingStateChange: setStreaming,
        onMessagesUpdate: (messages: ChatItem[]) => {
          // Convert messages to string for display (backward compatibility)
          const messagesText = messages.map((m) => `${m.name}: ${m.message}`).join('\n');
          setStreamingMessages(messagesText);
        },
        onError: (error) => {
          console.error('[Chat Generation Error]', error);
          setLoading(false);
          setStreaming(false);
        },
      });
    },
    [anthropicKey, useTestData, messenger]
  );

  return {
    loading,
    streaming,
    streamingMessages,
    loadingManager: services.loadingManager,
    generateChat,
  };
}
