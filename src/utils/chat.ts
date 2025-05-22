import { ChatItem } from '../types/chat';

export function getFirstChatItemDateTime(chatItems: ChatItem[]): { date: string; time: string } {
  const firstChatItem = chatItems[0];
  const time = firstChatItem ? `at ${firstChatItem.time}` : 'at 1:30 PM';
  const date = 'Today';

  return { date, time };
}

export function isLastChatItemSender(chatItems: ChatItem[]): boolean {
  const lastChatItem = chatItems[chatItems.length - 1];
  return lastChatItem?.role === 'sender';
}

export function getRecipientName(chatItems: ChatItem[], isFirst = true): string {
  const recipientItem = chatItems.find((item) => item.role === 'recipient');

  if (isFirst) {
    return recipientItem.name.split(' ')[0];
  }

  return recipientItem.name;
}

export function getRecipientGender(items: ChatItem[]): string {
  const recipientItem = items.find((item) => item.role === 'recipient');
  return recipientItem?.gender || 'Unknown';
}
