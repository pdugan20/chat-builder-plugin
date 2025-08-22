// Emoji styles available in the component library
export const EMOJI_STYLES = {
  COLOR: 'color',
  TRANSPARENT_BLUE: 'transparentBlue',
  TRANSPARENT_GREEN: 'transparentGreen',
} as const;

// Available emoji reactions
export const EMOJI_REACTIONS = {
  HEART: 'heart',
  HAHA: 'haha',
  EXCLAMATION: 'exclamation',
  THUMBS_UP: 'thumbsUp',
  THUMBS_DOWN: 'thumbsDown',
  QUESTION: 'question',
} as const;

// Type for emoji key entries
type EmojiKeyEntry = Record<string, { key: string; id: string }>;

// Mutable emoji key storage for component IDs (populated at runtime)
const EMOJI_KEY: Record<string, EmojiKeyEntry> = {
  [EMOJI_STYLES.COLOR]: {},
  [EMOJI_STYLES.TRANSPARENT_BLUE]: {},
  [EMOJI_STYLES.TRANSPARENT_GREEN]: {},
};

export default EMOJI_KEY;
