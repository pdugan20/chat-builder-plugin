import { EMOJI_STYLES } from '../../constants/emojis';

export interface EmojiStyle {
  [EMOJI_STYLES.COLOR]: Record<string, { id: string }>;
  [EMOJI_STYLES.TRANSPARENT_BLUE]: Record<string, { id: string }>;
  [EMOJI_STYLES.TRANSPARENT_GREEN]?: Record<string, { id: string }>;
}

export interface ComponentPropertyNames {
  emoji: string;
  senderBubble: string[];
  recipientBubble: string[];
}
