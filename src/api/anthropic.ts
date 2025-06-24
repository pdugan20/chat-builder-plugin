import Anthropic from '@anthropic-ai/sdk';
import { QueryInputs, QueryResponse } from '../types/api';
import { getExamplePrompt, getInstructionsPrompt } from '../utils/prompts';
import handleAnthropicError from '../utils/api-error-handling';
import API_CONSTANTS from '../constants/api';

interface AnthropicMessage {
  type: string;
  delta?: {
    type: string;
    text?: string;
  };
}

interface AnthropicError {
  error?: {
    error?: {
      type: string;
      message?: string;
    };
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function attemptRequest(
  anthropic: Anthropic,
  queryInputs: QueryInputs,
  onStream?: (chunk: string) => void
): Promise<QueryResponse> {
  let rawResponse = '';
  let currentMessage = '';
  const completeResponse: AnthropicMessage[] = [];

  const stream = await anthropic.messages.create({
    model: API_CONSTANTS.CLAUDE_MODEL,
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
            text: getInstructionsPrompt(queryInputs),
          },
        ],
      },
    ],
  });

  // eslint-disable-next-line no-restricted-syntax
  for await (const message of stream) {
    if (message.type === 'content_block_delta' && message.delta?.type === 'text_delta' && message.delta?.text) {
      const { text } = message.delta;

      rawResponse = `${rawResponse}${text}`;
      currentMessage = `${currentMessage}${text}`;

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

  if (!rawResponse) {
    throw new Error('No response generated from API');
  }

  const response = {
    id: 'streamed-response',
    type: 'message',
    role: 'assistant',
    model: API_CONSTANTS.CLAUDE_MODEL,
    content: [{ type: 'text', text: rawResponse }],
  };

  return response;
}

async function retryWithDelay(
  anthropic: Anthropic,
  queryInputs: QueryInputs,
  onStream?: (chunk: string) => void,
  attempt = 0
): Promise<QueryResponse> {
  try {
    return await attemptRequest(anthropic, queryInputs, onStream);
  } catch (error) {
    const isOverloaded =
      (error instanceof Error && error.message.includes('overloaded_error')) ||
      (error as AnthropicError)?.error?.error?.type === 'overloaded_error';

    if (isOverloaded && attempt < MAX_RETRIES - 1) {
      await delay(RETRY_DELAY);
      return retryWithDelay(anthropic, queryInputs, onStream, attempt + 1);
    }

    const errorDetails = handleAnthropicError(error as AnthropicError);
    throw new Error(errorDetails.message);
  }
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
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  return retryWithDelay(anthropic, queryInputs, onStream);
}
