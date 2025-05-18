import Anthropic from '@anthropic-ai/sdk';
import { QueryInputs, QueryResponse } from '../types/api';
import { getExamplePrompt, getInstructionsPrompt } from '../utils/prompts';
import { MESSAGE_TYPE } from '../constants/messages';

interface ErrorDetails {
  type: string;
  message: string;
  retryable: boolean;
}

export default async function createChatQuery({
  apiKey,
  queryInputs,
}: {
  apiKey: string;
  queryInputs: QueryInputs;
}): Promise<QueryResponse> {
  const { participants, maxMessages, prompt } = queryInputs;
  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const chatBlob = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 8192,
      temperature: 1,
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
    return chatBlob;
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

    return null;
  }
}
