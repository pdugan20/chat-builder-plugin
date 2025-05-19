import { libraryComponentKey } from '../constants/keys';
import { ComponentSets } from '../types/chat';
import emojiKey from '../constants/emojis';
import { findColorHeart, addHeartToStyles, processComponent } from '../utils/components';

export async function loadComponentSets(): Promise<ComponentSets> {
  const allNodes = figma.root.findAll();
  const localComponentSets = allNodes.filter((node) => node.type === 'COMPONENT_SET');

  const componentKeys = [
    libraryComponentKey.senderBubble.key,
    libraryComponentKey.recipientBubble.key,
    libraryComponentKey.statusBanner.key,
    libraryComponentKey.timestamp.key,
  ];

  const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const hasChatBuilderLibrary = collections.some((collection) => collection.libraryName === 'iMessage Chat Builder');

  if (hasChatBuilderLibrary) {
    const localComponentKeys = componentKeys.map((key) => {
      const componentInfo = Object.values(libraryComponentKey).find((info) => info.key === key);
      if (!componentInfo) return key;

      const localComponent = localComponentSets.find((set) => set.name === componentInfo.name);
      return localComponent?.key || key;
    });

    const [senderSet, recipientSet, statusSet, timestampSet] = await Promise.all(
      localComponentKeys.map((key) => figma.importComponentSetByKeyAsync(key))
    );

    return { senderSet, recipientSet, statusSet, timestampSet };
  }

  const [senderSet, recipientSet, statusSet, timestampSet] = await Promise.all(
    componentKeys.map((key) => figma.importComponentSetByKeyAsync(key))
  );

  return { senderSet, recipientSet, statusSet, timestampSet };
}

export async function updateEmojiKeyIds(): Promise<void> {
  const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const hasChatBuilderLibrary = collections.some((collection) => collection.libraryName === 'iMessage Chat Builder');

  if (!hasChatBuilderLibrary) {
    const allNodes = figma.root.findAll();
    const localComponents = allNodes.filter(
      (node): node is ComponentNode | ComponentSetNode =>
        (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') &&
        (node.name.startsWith('System') || node.name.startsWith('iMessage'))
    );

    const colorHeartInfo = findColorHeart(localComponents);
    if (colorHeartInfo) {
      addHeartToStyles(colorHeartInfo);
    }

    const promises = localComponents.map((component) => processComponent(component));
    await Promise.all(promises);
    return;
  }

  const promises: Promise<void>[] = Object.entries(emojiKey).flatMap(([style, emojis]) =>
    Object.entries(emojis).map(async ([key, value]) => {
      try {
        const component: ComponentNode = await figma.importComponentByKeyAsync(value.key);
        emojiKey[style][key].id = component.id;
      } catch (error) {
        //
      }
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
