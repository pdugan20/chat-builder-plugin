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
}

export interface MessageInstanceProps {
  role: 'sender' | 'recipient';
  message: string;
  emojiReaction: string | null;
  messagesInGroup: number;
  bubbleStyle: string;
  index: number;
  componentSet: ComponentSetNode;
  messages: string[];
}

export interface ChatItem {
  name: string;
  gender: string;
  role: 'sender' | 'recipient';
  message: string;
  time: string;
  date?: string;
  emojiReaction: string | null;
  messagesInGroup: number;
}
