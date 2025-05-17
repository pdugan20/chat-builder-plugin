import Anthropic from '@anthropic-ai/sdk';
import { QueryInputs, QueryResponse } from '../types/api';
import { getExamplePrompt, getInstructionsPrompt } from '../utils/prompts';

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
  } catch (response) {
    if (response.error) {
      parent.postMessage({ pluginMessage: { type: 'POST_API_ERROR', errorType: response.error.error.type } }, '*');
    }
    return null;
  }
}
