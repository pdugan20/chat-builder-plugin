import Anthropic from '@anthropic-ai/sdk';
import { QueryInputs, QueryResponse } from '../types/api';
import { getExamplePrompt, getInstructionsPrompt } from '../utils/prompts';
import { MESSAGE_TYPE } from '../constants/messages';

interface ErrorDetails {
  type: string;
  message: string;
  retryable: boolean;
}

interface AnthropicMessage {
  type: string;
  delta?: {
    type: string;
    text?: string;
  };
}

export default async function createChatQuery({
  apiKey,
  queryInputs,
  onStream,
}: {
  apiKey: string;
  queryInputs: QueryInputs;
  onStream?: (chunk: string) => void;
}): Promise<QueryResponse> {
  const { participants, maxMessages, prompt } = queryInputs;
  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    let rawResponse = '';
    let currentMessage = '';
    const completeResponse: AnthropicMessage[] = [];

    const stream = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 8192,
      temperature: 1,
      stream: true,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: getExamplePrompt(),
            },
            {
              type: 'text',
              text: getInstructionsPrompt({ prompt, maxMessages, participants }),
            },
          ],
        },
      ],
    });

    // eslint-disable-next-line no-restricted-syntax
    for await (const message of stream) {
      if (message.type === 'content_block_delta' && message.delta?.type === 'text_delta' && message.delta?.text) {
        const { text } = message.delta;

        // Accumulate the text from the delta
        rawResponse = `${rawResponse}${text}`;
        currentMessage = `${currentMessage}${text}`;

        // Try to extract and stream message content
        if (text.includes('"message":')) {
          try {
            const messageMatch = currentMessage.match(/"message"\s*:\s*"([^"]+)"/);
            if (messageMatch && messageMatch[1]) {
              onStream?.(messageMatch[1]);
              currentMessage = currentMessage.slice(messageMatch.index + messageMatch[0].length);
            }
          } catch (e) {
            // Error parsing message
          }
        }

        // Store each message in the complete response
        const messageToStore: AnthropicMessage = {
          type: message.type,
          delta: message.delta
            ? {
                type: message.delta.type,
                text: message.delta.text,
              }
            : undefined,
        };
        completeResponse.push(messageToStore);
      }
    }

    // Ensure we always return a valid response
    if (!rawResponse) {
      rawResponse = 'No response generated';
    }

    return {
      id: 'streamed-response',
      type: 'message',
      role: 'assistant',
      model: 'claude-3-7-sonnet-20250219',
      content: [{ type: 'text', text: rawResponse }],
    };
  } catch (error) {
    let errorDetails: ErrorDetails = {
      type: 'unknown_error',
      message: 'An unexpected error occurred',
      retryable: true,
    };

    if (error.error?.error?.type) {
      switch (error.error.error.type) {
        case 'authentication_error':
          errorDetails = {
            type: 'authentication_error',
            message: 'Your API key is invalid or has expired',
            retryable: false,
          };
          break;
        case 'rate_limit_error':
          errorDetails = {
            type: 'rate_limit_error',
            message: 'Too many requests. Please wait a moment and try again',
            retryable: true,
          };
          break;
        case 'overloaded_error':
          errorDetails = {
            type: 'overloaded_error',
            message: 'The API is currently experiencing high load',
            retryable: true,
          };
          break;
        case 'invalid_request_error':
          errorDetails = {
            type: 'invalid_request_error',
            message: 'The request was invalid. Please check your inputs',
            retryable: false,
          };
          break;
        default:
          errorDetails = {
            type: error.error.error.type,
            message: error.error.error.message || 'An error occurred',
            retryable: true,
          };
      }
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPE.POST_API_ERROR,
          errorType: errorDetails.type,
          errorMessage: errorDetails.message,
          retryable: errorDetails.retryable,
        },
      },
      '*'
    );

    throw error;
  }
}
