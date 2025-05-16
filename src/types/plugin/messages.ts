interface BaseKeyMessage {
  type: 'HAS_ANTHROPIC_KEY' | 'UPDATE_ANTHROPIC_KEY';
  key?: string;
}

export interface HasKeyMessage extends BaseKeyMessage {
  type: 'HAS_ANTHROPIC_KEY';
  hasKey: boolean;
}

export interface UpdateKeyMessage extends BaseKeyMessage {
  type: 'UPDATE_ANTHROPIC_KEY';
  keyDidUpdate: boolean;
}

export type KeyMessage = HasKeyMessage | UpdateKeyMessage;

export interface PluginMessage {
  type: 'UPDATE_ANTHROPIC_KEY' | 'BUILD_CHAT_UI' | 'POST_API_ERROR';
  apiKey?: string;
  data?: string;
  style?: string;
  prompt?: string;
  errorType?: string;
}
