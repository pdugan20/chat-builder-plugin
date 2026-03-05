const CLAUDE_MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const SYSTEM_MESSAGE = `You generate realistic iMessage conversations as JSON arrays for rendering as visual mockups in Figma. Structural accuracy is critical because the output is parsed directly into UI components.

Output ONLY a valid JSON array. No preamble, commentary, or markdown. Start with [ and end with ].

Each object in the array must have exactly these fields:
- "name": string (realistic first and last name)
- "gender": "male" or "female"
- "role": "sender" or "recipient"
- "message": string (the text message)
- "time": string in "H:MM AM/PM" format
- "emojiReaction": null or one of "heart", "haha", "exclamation", "thumbsUp", "thumbsDown", "question"
- "messagesInGroup": number (total consecutive messages by the same person in that group)

Conversation style rules:
- Write like real people texting: short, casual, natural
- Messages should be very short (5-15 words typical, 25 words max)
- Use contractions and informal language
- No formal language or paragraph-length messages
- Use emoji reactions sparingly (2-4 total per conversation)`;

export default {
  CLAUDE_MODEL,
  MAX_TOKENS,
  TEMPERATURE,
  MAX_RETRIES,
  RETRY_DELAY,
  SYSTEM_MESSAGE,
};
