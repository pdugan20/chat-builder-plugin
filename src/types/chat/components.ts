import { CHAT_ROLES } from '../../constants/components';

export interface ComponentSets {
  senderSet: ComponentSetNode;
  recipientSet: ComponentSetNode;
  statusSet: ComponentSetNode;
  timestampSet: ComponentSetNode;
}

export interface BuildChatUserInterfaceProps {
  theme?: 'light' | 'dark';
  data: ChatItem[];
  width?: number;
  itemSpacing?: number;
  bubbleStyle?: 'iOS' | 'Android';
  name?: string;
  includePrototype?: boolean;
}

export interface MessageInstanceProps {
  role: typeof CHAT_ROLES.SENDER | typeof CHAT_ROLES.RECIPIENT;
  message: string;
  emojiReaction: string | null;
  messagesInGroup: number;
  bubbleStyle: string;
  index: number;
  componentSet: ComponentSetNode;
  messages: string[];
  senderName?: string;
}

export interface ChatItem {
  name: string;
  gender: string;
  role: typeof CHAT_ROLES.SENDER | typeof CHAT_ROLES.RECIPIENT;
  message: string;
  time: string;
  date?: string;
  emojiReaction: string | null;
  messagesInGroup: number;
}
