export interface ChatItem {
  participantName: string;
  gender: string;
  role: 'sender' | 'recipient';
  message: string;
  time: string;
  date?: string;
  emojiReaction: string | null;
  messagesInGroup: number;
}
