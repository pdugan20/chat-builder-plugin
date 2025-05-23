export const THREAD_PROPERTIES = {
  VARIANT: 'Type=1:1',
  PLACEHOLDER: 'PLACEHOLDER_THREAD',
  NAV_BAR: 'Thread Navigation Bar',
  CHAT_NAME: 'Chat name#424:0',
  PERSONA: 'Persona',
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
  SENDER_BUBBLE: ['First bubble#80:3', 'Second bubble#80:4', 'Third bubble#80:7'],
  RECIPIENT_BUBBLE: ['First bubble#41:2', 'Second bubble#40:1', 'Third bubble#45:0'],
  EMOJI: 'Emoji#86:0',
} as const;
