import { MessageType, MESSAGE_TYPE } from '../../constants/messages';

export interface BaseMessage {
  type: MessageType;
}

export interface HasKeyMessage extends BaseMessage {
  type: typeof MESSAGE_TYPE.HAS_ANTHROPIC_KEY;
  hasKey: boolean;
  key?: string;
}

export interface UpdateKeyMessage extends BaseMessage {
  type: typeof MESSAGE_TYPE.UPDATE_ANTHROPIC_KEY;
  keyDidUpdate: boolean;
  key?: string;
}

export interface BuildChatUIMessage extends BaseMessage {
  type: typeof MESSAGE_TYPE.BUILD_CHAT_UI;
  data: unknown;
  style: string;
  prompt: string;
}

export interface PostApiErrorMessage extends BaseMessage {
  type: typeof MESSAGE_TYPE.POST_API_ERROR;
  errorType: string;
  errorMessage: string;
  retryable: boolean;
}

export type PluginMessage = HasKeyMessage | UpdateKeyMessage | BuildChatUIMessage | PostApiErrorMessage;
