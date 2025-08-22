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
  NUM_BUBBLES: 'Bubbles',
  HAS_REACTION: 'Has reaction',
  HAS_MUSTACHE_TEXT: 'Has mustache text',
  IS_GROUP_CHAT: 'Is group chat',
  MUSTACHE_TEXT: 'Mustache#129:16',
  HAS_ACTION: 'Has action',
} as const;

export const COMPONENT_NAMES = {
  THREAD: 'Thread',
  PERSONA: 'Persona',
  PROTOTYPE: 'Prototype',
  MESSAGE_TEXT: 'Message Text',
  SENDER_NAME: 'Sender Name',
  PROFILE_PHOTO: 'Profile Photo',
  NAVIGATION_BAR_PHOTO: 'Navigation Bar Photo',
} as const;

export const TIMESTAMP_BANNER_PROPERTIES = {
  DATE: 'Date',
  TIME: 'Time',
} as const;

export const STATUS_BANNER_PROPERTIES = {
  BANNER_TEXT: 'Notification Text',
} as const;

export const VARIABLE_COLLECTIONS = {
  COLOR_COLLECTION: 'Color',
} as const;

export const PHOTO_PROPERTIES = {
  TWO_PHOTOS: 'Group (3)',
  THREE_PHOTOS: 'Group (4)',
} as const;

export const PROPERTY_VALUES = {
  YES: 'Yes',
  NO: 'No',
} as const;

export const CHAT_ROLES = {
  SENDER: 'sender',
  RECIPIENT: 'recipient',
} as const;
