export const THREAD_PROPERTIES = {
  VARIANT: 'Type=1:1',
  VARIANT_GROUP: 'Type=Group',
  PLACEHOLDER: 'PLACEHOLDER_THREAD',
  NAV_BAR: 'Thread Navigation Bar',
  CHAT_NAME: 'Chat name#424:0',
  PERSONA: 'Persona',
  PHOTO_TYPE: 'Photo type#424:1',
} as const;

export const VARIABLES = {
  THREAD_BACKGROUND: 'Background/General/Thread',
} as const;

export const THREAD_COMPONENT_SETS = {
  SENDER_BUBBLE: { key: null, name: 'Sender Bubble' },
  RECIPIENT_BUBBLE: { key: null, name: 'Recipient Bubble' },
  TIMESTAMP: { key: null, name: 'Timestamp' },
  STATUS_BANNER: { key: null, name: 'Status' },
} as const;

export const BUBBLE_PROPERTIES = {
  EMOJI: 'Emoji#86:0',
} as const;
