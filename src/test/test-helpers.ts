import { ChatItem } from '../types/chat';

/**
 * Helper function to create valid ChatItem objects for testing
 */
export default function createMockChatItem(overrides: Partial<ChatItem> = {}): ChatItem {
  return {
    name: 'Test User',
    gender: 'male',
    role: 'sender',
    message: 'Test message',
    time: '3:15 PM',
    emojiReaction: null,
    messagesInGroup: 1,
    ...overrides,
  };
}
