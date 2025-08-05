const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 3000;
const TEMPERATURE = 0.8;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const SYSTEM_MESSAGE = 'You are a helpful assistant that generates realistic iMessage conversations. Respond only with valid JSON arrays.';

export default {
  CLAUDE_MODEL,
  MAX_TOKENS,
  TEMPERATURE,
  MAX_RETRIES,
  RETRY_DELAY,
  SYSTEM_MESSAGE,
};
