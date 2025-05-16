import { componentPropertyName } from '../constants/keys';
import flipHorizontal from '../utils/transform';
import emojiKey from '../constants/emojis';
import { ChatItem, BuildChatUserInterfaceProps } from '../types/chat';
import { MessageInstanceProps } from '../types/chat/components';
import { buildFrame } from '../utils/frame';
import { getFirstChatItemDateTime, isLastChatItemSender, getRecipientName } from '../utils/chat';
import {
  loadComponentSets,
  updateEmojiKeyIds,
  createTimestampInstance,
  createStatusInstance,
} from '../services/component';

function handleEmojiReaction(instance: InstanceNode, props: MessageInstanceProps): void {
  if (instance.exposedInstances.length > 0 && props.emojiReaction) {
    const emojiInstance: InstanceNode = instance.exposedInstances[0];
    const emojiStyle = props.role === 'sender' ? 'color' : 'transparentBlue';

    if (props.role === 'recipient') {
      emojiInstance.setProperties({ Style: props.bubbleStyle });
    }

    emojiInstance.setProperties({
      [componentPropertyName.emoji]: emojiKey[emojiStyle][props.emojiReaction].id,
    });
  }
}

function setMessageGroupProperties(
  instance: InstanceNode,
  props: MessageInstanceProps,
  bubbleKeys: string[],
  chatItems: ChatItem[]
): void {
  for (let i: number = 0; i < props.messagesInGroup; i += 1) {
    const bubbleKey: string = bubbleKeys[i];
    if (bubbleKey && chatItems[props.index + i]) {
      instance.setProperties({
        [bubbleKey]: chatItems[props.index + i].message,
      });
      props.messages.push(chatItems[props.index + i].message);
    }
  }
}

function createSenderInstance(props: MessageInstanceProps, chatItems: ChatItem[]): InstanceNode {
  const instance: InstanceNode = props.componentSet.defaultVariant.createInstance();
  const bubbleKeys: string[] = componentPropertyName.senderBubble;
  const bubble: string = bubbleKeys[0];

  instance.setProperties({
    Bubbles: props.messagesInGroup.toString(),
    Style: props.bubbleStyle,
    'Has reaction': props.emojiReaction ? 'Yes' : 'No',
    'Has mustache text': 'No',
    [bubble]: props.message,
  });

  setMessageGroupProperties(instance, props, bubbleKeys, chatItems);
  handleEmojiReaction(instance, props);

  if (props.index === chatItems.length - 1) {
    instance.setProperties({
      'Has mustache text': 'Yes',
      'Mustache#129:16': 'Delivered Quietly',
    });
  }

  return instance;
}

function createRecipientInstance(props: MessageInstanceProps, chatItems: ChatItem[]): InstanceNode {
  const instance: InstanceNode = props.componentSet.defaultVariant.createInstance();
  const bubbleKeys: string[] = componentPropertyName.recipientBubble;
  const bubble: string = bubbleKeys[0];

  instance.setProperties({
    Bubbles: props.messagesInGroup.toString(),
    'Is group chat': 'No',
    'Has reaction': props.emojiReaction ? 'Yes' : 'No',
    'Has mustache text': 'No',
    [bubble]: props.message,
  });

  setMessageGroupProperties(instance, props, bubbleKeys, chatItems);
  handleEmojiReaction(instance, props);
  instance.relativeTransform = flipHorizontal(instance);

  return instance;
}

async function createMessageInstance(
  item: ChatItem,
  index: number,
  componentSet: ComponentSetNode,
  bubbleStyle: string,
  messages: string[],
  chatItems: ChatItem[]
): Promise<InstanceNode | null> {
  const { role, message, emojiReaction, messagesInGroup } = item;

  if (messages.includes(message)) {
    return null;
  }

  const props: MessageInstanceProps = {
    role,
    message,
    emojiReaction,
    messagesInGroup,
    bubbleStyle,
    index,
    componentSet,
    messages,
  };

  const instance =
    role === 'sender' ? createSenderInstance(props, chatItems) : createRecipientInstance(props, chatItems);

  messages.push(message);
  return instance;
}

export default async function buildChatUserInterface({
  theme = 'light',
  width = 402,
  itemSpacing = 8,
  bubbleStyle = 'iOS',
  name,
  data,
}: BuildChatUserInterfaceProps): Promise<void> {
  const messages: string[] = [];
  const items = data;
  const { senderSet, recipientSet, statusSet, timestampSet } = await loadComponentSets();
  const frame: FrameNode = await buildFrame(theme, width, itemSpacing, name);

  // Create and append timestamp
  const { date, time } = getFirstChatItemDateTime(items);
  const timestampInstance = await createTimestampInstance(timestampSet, date, time);

  frame.appendChild(timestampInstance);
  timestampInstance.layoutSizingHorizontal = 'FILL';

  // Update emoji IDs
  await updateEmojiKeyIds();

  // Create and append messages
  const messagePromises = items.map(async (item: ChatItem, index: number) => {
    const componentSet = item.role === 'sender' ? senderSet : recipientSet;
    const messageInstance = await createMessageInstance(item, index, componentSet, bubbleStyle, messages, items);

    if (messageInstance) {
      frame.appendChild(messageInstance);
      messageInstance.layoutSizingHorizontal = 'FILL';
    }
  });

  // Create and append status
  const recipientName = getRecipientName(items);
  const hasAction = isLastChatItemSender(items);
  const statusInstance = await createStatusInstance(
    statusSet,
    `${recipientName} has notifications silenced`,
    hasAction
  );

  frame.appendChild(statusInstance);
  statusInstance.layoutSizingHorizontal = 'FILL';

  await Promise.all(messagePromises);
  figma.viewport.scrollAndZoomIntoView([frame]);
}
