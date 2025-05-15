export interface EmojiStyle {
  color: Record<string, { id: string }>;
  transparentBlue: Record<string, { id: string }>;
}

export interface ComponentPropertyNames {
  emoji: string;
  senderBubble: string[];
  recipientBubble: string[];
}
