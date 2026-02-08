import { ChatItem } from '../types/chat';
import { CHAT_ROLES } from '../constants/components';

export function getFirstChatItemDateTime(chatItems: ChatItem[]): { date: string; time: string } {
  const firstChatItem = chatItems[0];
  const time = firstChatItem ? `at ${firstChatItem.time}` : 'at 1:30 PM';
  const date = 'Today';

  return { date, time };
}

export function isLastChatItemSender(chatItems: ChatItem[]): boolean {
  const lastChatItem = chatItems[chatItems.length - 1];
  return lastChatItem?.role === CHAT_ROLES.SENDER;
}

export function getRecipientName(chatItems: ChatItem[], isFirst = true): string {
  const recipientItem = chatItems.find((item) => item.role === CHAT_ROLES.RECIPIENT);

  if (!recipientItem) {
    return 'Unknown';
  }

  if (isFirst) {
    return getFirstName(recipientItem.name);
  }

  return recipientItem.name;
}

export function getUniqueRecipients(items: ChatItem[]): Set<string> {
  return new Set(items.filter((item) => item.role === CHAT_ROLES.RECIPIENT).map((item) => item.name));
}

export function isGroupChat(items: ChatItem[]): boolean {
  return getUniqueRecipients(items).size > 1;
}

export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

export function getRecipientsList(items: ChatItem[]): Array<{ name: string; gender: string }> {
  const recipients = items
    .filter((item) => item.role === CHAT_ROLES.RECIPIENT)
    .reduce(
      (unique, item) => {
        if (!unique.some((u) => u.name === item.name)) {
          unique.push({ name: item.name, gender: item.gender });
        }
        return unique;
      },
      [] as Array<{ name: string; gender: string }>
    );

  // Sort recipients by name for consistent ordering
  recipients.sort((a, b) => a.name.localeCompare(b.name));
  return recipients;
}
