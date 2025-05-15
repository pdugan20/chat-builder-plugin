import chatData from '../constants/test-data';
import { componentPropertyName } from '../constants/keys';
import flipHorizontal from '../utils/transform';
import emojiKey from '../constants/emojis';
import { ChatItem, BuildChatUserInterfaceProps } from '../types/chat';
import { buildFrame } from '../utils/frame';
import { getFirstChatItemDateTime, isLastChatItemSender, getRecipientName } from '../utils/chat';
import {
  loadComponentSets,
  updateEmojiKeyIds,
  createTimestampInstance,
  createStatusInstance,
} from '../services/component';

export default async function buildChatUserInterface({
  theme = 'light',
  width = 402,
  itemSpacing = 8,
  bubbleStyle = 'iOS',
  name,
}: BuildChatUserInterfaceProps): Promise<void> {
  const messages: string[] = [];

  const { senderSet, recipientSet, statusSet, timestampSet } = await loadComponentSets();

  const frame: FrameNode = await buildFrame(theme, width, itemSpacing, name);
  const { date, time } = getFirstChatItemDateTime(chatData as ChatItem[]);
  const timestampInstance: InstanceNode = await createTimestampInstance(timestampSet, date, time);

  const recipientName = getRecipientName(chatData as ChatItem[]);
  const hasAction = isLastChatItemSender(chatData as ChatItem[]);
  const statusInstance: InstanceNode = await createStatusInstance(
    statusSet,
    `${recipientName} has notifications silenced`,
    hasAction
  );

  frame.appendChild(timestampInstance);
  timestampInstance.layoutSizingHorizontal = 'FILL';

  await updateEmojiKeyIds();

  const chatUserInterfaceDidDraw = chatData.map(async (item: ChatItem, index: number): Promise<void> => {
    const { role, message, emojiReaction, messagesInGroup } = item;

    const bubbleKeys: string[] =
      role === 'sender' ? componentPropertyName.senderBubble : componentPropertyName.recipientBubble;
    const bubble: string = bubbleKeys[0];

    if (!messages.includes(message)) {
      const hasReaction = emojiReaction ? 'Yes' : 'No';

      if (role === 'sender') {
        const senderInstance: InstanceNode = senderSet.defaultVariant.createInstance();

        senderInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          Style: bubbleStyle,
          'Has reaction': hasReaction,
          'Has mustache text': 'No',
          [bubble]: message,
        });

        for (let i: number = 0; i < messagesInGroup; i += 1) {
          const bubbleKey: string = bubbleKeys[i];
          if (bubbleKey && chatData[index + i]) {
            senderInstance.setProperties({
              [bubbleKey]: chatData[index + i].message,
            });
            messages.push(chatData[index + i].message);
          }
        }

        if (senderInstance.exposedInstances.length > 0) {
          const emojiInstance: InstanceNode = senderInstance.exposedInstances[0];

          emojiInstance.setProperties({
            [componentPropertyName.emoji]: emojiKey.color[emojiReaction].id,
          });
        }

        if (index === chatData.length - 1) {
          senderInstance.setProperties({
            'Has mustache text': 'Yes',
            'Mustache#129:16': 'Delivered Quietly',
          });
        }

        messages.push(message);
        frame.appendChild(senderInstance);
        senderInstance.layoutSizingHorizontal = 'FILL';
      }

      if (role === 'recipient') {
        const recipientInstance: InstanceNode = recipientSet.defaultVariant.createInstance();

        recipientInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          'Is group chat': 'No',
          'Has reaction': hasReaction,
          'Has mustache text': 'No',
          [bubble]: message,
        });

        for (let i: number = 0; i < messagesInGroup; i += 1) {
          const bubbleKey: string = bubbleKeys[i];
          if (bubbleKey && chatData[index + i]) {
            recipientInstance.setProperties({
              [bubbleKey]: chatData[index + i].message,
            });
            messages.push(chatData[index + i].message);
          }
        }

        if (recipientInstance.exposedInstances.length > 0) {
          const emojiInstance: InstanceNode = recipientInstance.exposedInstances[0];

          emojiInstance.setProperties({
            Style: bubbleStyle,
            [componentPropertyName.emoji]: emojiKey.transparentBlue[emojiReaction].id,
          });
        }

        messages.push(message);

        recipientInstance.relativeTransform = flipHorizontal(recipientInstance);
        frame.appendChild(recipientInstance);
        recipientInstance.layoutSizingHorizontal = 'FILL';
      }
    }
  });

  frame.appendChild(statusInstance);
  statusInstance.layoutSizingHorizontal = 'FILL';

  await Promise.all(chatUserInterfaceDidDraw);
  figma.viewport.scrollAndZoomIntoView([frame]);
}
