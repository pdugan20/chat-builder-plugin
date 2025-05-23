import { THREAD_COMPONENT_SETS } from '../constants/components';
import { ComponentSets } from '../types/chat';
import emojiKey from '../constants/emojis';
import {
  findColorHeart,
  addHeartToStyles,
  processComponent,
  transformStyleName,
  transformEmojiName,
} from '../utils/components';

export async function loadComponentSets(): Promise<ComponentSets> {
  const allNodes = figma.root.findAll();
  const localComponentSets = allNodes.filter((node) => node.type === 'COMPONENT_SET');

  // Find components by name since keys are null
  const senderSet = localComponentSets.find((set) => set.name === THREAD_COMPONENT_SETS.SENDER_BUBBLE.name);
  const recipientSet = localComponentSets.find((set) => set.name === THREAD_COMPONENT_SETS.RECIPIENT_BUBBLE.name);
  const statusSet = localComponentSets.find((set) => set.name === THREAD_COMPONENT_SETS.STATUS_BANNER.name);
  const timestampSet = localComponentSets.find((set) => set.name === THREAD_COMPONENT_SETS.TIMESTAMP.name);

  if (!senderSet || !recipientSet || !statusSet || !timestampSet) {
    throw new Error('Could not find all required component sets');
  }

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

  // Find all emoji components
  const allNodes = figma.root.findAll();
  const emojiComponents = allNodes.filter(
    (node): node is ComponentNode =>
      node.type === 'COMPONENT' && (node.name.startsWith('System/') || node.name.startsWith('iMessage/'))
  );

  // Process each emoji component
  const promises = emojiComponents.map(async (component) => {
    const nameParts = component.name.split('/');
    if (nameParts.length < 3) return;

    // Transform style name before using it
    const originalStyle = nameParts[1].toLowerCase();
    const style = transformStyleName(originalStyle);

    // Transform emoji name before any checks
    const originalEmojiName = nameParts[2].toLowerCase();
    const emojiName = transformEmojiName(originalEmojiName);

    // Skip heart as it's already been added
    if (emojiName === 'heart') return;

    if (!emojiKey[style]) {
      emojiKey[style] = {};
    }

    emojiKey[style][emojiName] = {
      key: component.key,
      id: component.id,
    };
  });

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
  const availableProps = statusSet.componentPropertyDefinitions;

  const notificationLabel = statusInstance.findOne(
    (node: { type: string; name: string }) => node.type === 'TEXT' && node.name === 'Notification Text'
  ) as TextNode;

  if (notificationLabel) {
    notificationLabel.characters = notificationText;
  }

  // Only set the property if it exists in the component
  if ('Has action' in availableProps) {
    statusInstance.setProperties({
      'Has action': hasAction ? 'Yes' : 'No',
    });
  }

  return statusInstance;
}
