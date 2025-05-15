export interface ComponentSets {
  senderSet: ComponentSetNode;
  recipientSet: ComponentSetNode;
  statusSet: ComponentSetNode;
  timestampSet: ComponentSetNode;
}

export interface BuildChatUserInterfaceProps {
  theme?: 'light' | 'dark';
  data: string;
  width?: number;
  itemSpacing?: number;
  bubbleStyle?: 'iOS' | 'Android';
  name?: string;
}
