import Anthropic from '@anthropic-ai/sdk';

interface QueryInputs {
  participants: string;
  maxMessages: string;
  prompt: string;
}

interface QueryResponse {
  id: string;
  type: string;
  role: string;
  model: string;
  content: unknown;
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
      max_tokens: 20000,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are tasked with generating an iMessage chat conversation based on user inputs. The conversation should be realistic, engaging, and formatted according to specific requirements. Follow these instructions carefully to create the conversation:\n\n1. Input variables:\n<topic_and_tone>${prompt}</topic_and_tone>\n\n<max_messages>${maxMessages}</max_messages>\n\n<num_participants>${participants}</num_participants>\n\n2. Participant information:\n- Generate names for the number of participants specified in num_participants.\n- Each participant should have a first and last name.\n- Assign a gender (male or female) to each participant.\n- Designate one participant as the "sender" and the rest as "recipients".\n\n3. Message generation:\n- Create a conversation based on the topic_and_tone. If no specific tone is mentioned, keep it casual.\n- Generate between 1 and 3 messages for each participant's turn before switching to another participant.\n- Ensure the total number of messages does not exceed max_messages.\n- Assign a time to each message in AM/PM format.\n- Randomly add emoji reactions to some messages. Use only these reactions: heart, haha, exclamation, thumbsUp, thumbsDown, question.\n- If a user has sent multiple messages in a row, specify the number of messages as a number.\n\n4. JSON formatting:\n- Format the conversation as a JSON array where each object represents a message.\n- Include the following properties for each message:\n  - participantName\n  - gender\n  - role (sender or recipient)\n  - message\n  - time\n  - emojiReaction (if applicable)\n  - messages_in_row\n\n5. Example output format:\n[\n  {\n    "participantName": "John",\n    "gender": "male",\n    "role": "sender",\n    "message": "Hey everyone, what do you think about the new movie?",\n    "time": "2:30 PM",\n    "emojiReaction": null,\n    "messagesInGroup": 1\n  },\n  {\n    "participantName": "Sarah",\n    "gender": "female",\n    "role": "recipient",\n    "message": "I loved it! The special effects were amazing.",\n    "time": "2:32 PM",\n    "emojiReaction": "heart",\n    "messagesInGroup": 1\n  }\n]\n\n6. Generate the conversation:\n- Create a realistic conversation based on the given topic and tone.\n- Ensure the conversation flows naturally and stays on topic.\n- Format the entire conversation as a JSON array following the example output format.\n- Make sure to include all required properties for each message.`,
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
