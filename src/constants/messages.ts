export const MESSAGE_TYPE = {
  // Authentication & API related
  HAS_ANTHROPIC_KEY: 'HAS_ANTHROPIC_KEY',
  UPDATE_ANTHROPIC_KEY: 'UPDATE_ANTHROPIC_KEY',
  POST_API_ERROR: 'POST_API_ERROR',
  RETRY_GENERATION: 'RETRY_GENERATION',
  STREAM_UPDATE: 'STREAM_UPDATE',

  // UI & Component related
  BUILD_CHAT_UI: 'BUILD_CHAT_UI',
  BUILD_COMPLETE: 'BUILD_COMPLETE',
  HAS_FONTS: 'HAS_FONTS',
  HAS_COMPONENT_LIBRARY: 'HAS_COMPONENT_LIBRARY',
  HAS_LOCAL_COMPONENTS: 'HAS_LOCAL_COMPONENTS',
  RELOAD: 'RELOAD',
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

export function isValidMessageType(type: string): type is MessageType {
  return Object.values(MESSAGE_TYPE).includes(type as MessageType);
}
