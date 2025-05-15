import { componentKey } from '../constants/keys';
import { ComponentSets } from '../types/chat';
import emojiKey from '../constants/emojis';

export async function loadComponentSets(): Promise<ComponentSets> {
  const componentKeys = [
    componentKey.senderBubble,
    componentKey.recipientBubble,
    componentKey.statusBanner,
    componentKey.timestamp,
  ];

  const [senderSet, recipientSet, statusSet, timestampSet] = await Promise.all(
    componentKeys.map((key) => figma.importComponentSetByKeyAsync(key))
  );

  return { senderSet, recipientSet, statusSet, timestampSet };
}

export async function updateEmojiKeyIds(): Promise<void> {
  const promises: Promise<void>[] = Object.entries(emojiKey).flatMap(([style, emojis]) =>
    Object.entries(emojis).map(async ([key, value]) => {
      const component: ComponentNode = await figma.importComponentByKeyAsync(value.key);
      emojiKey[style][key].id = component.id;
    })
  );

  await Promise.all(promises);
}

export async function createTimestampInstance(
  timestampSet: ComponentSetNode,
  date: string,
  time: string
): Promise<InstanceNode> {
  const timestampInstance: InstanceNode = timestampSet.defaultVariant.createInstance();

  const dateLabel = timestampInstance.findOne(
    (node: { type: string; name: string }) => node.type === 'TEXT' && node.name === 'Date'
  ) as TextNode;
  const timeLabel = timestampInstance.findOne(
    (node: { type: string; name: string }) => node.type === 'TEXT' && node.name === 'Time'
  ) as TextNode;

  if (dateLabel) {
    dateLabel.characters = date;
  }

  if (timeLabel) {
    timeLabel.characters = time;
  }

  return timestampInstance;
}

export async function createStatusInstance(
  statusSet: ComponentSetNode,
  notificationText: string,
  hasAction: boolean
): Promise<InstanceNode> {
  const statusInstance: InstanceNode = statusSet.defaultVariant.createInstance();

  const notificationLabel = statusInstance.findOne(
    (node: { type: string; name: string }) => node.type === 'TEXT' && node.name === 'Notification Text'
  ) as TextNode;

  if (notificationLabel) {
    notificationLabel.characters = notificationText;
  }

  statusInstance.setProperties({
    'Has action': hasAction ? 'Yes' : 'No',
  });

  return statusInstance;
}
