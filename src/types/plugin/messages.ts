export interface PluginMessage {
  type: 'UPDATE_ANTHROPIC_KEY' | 'BUILD_CHAT_UI' | 'POST_API_ERROR';
  apiKey?: string;
  data?: string;
  style?: string;
  prompt?: string;
  errorType?: string;
}
