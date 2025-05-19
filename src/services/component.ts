import { libraryComponentKey } from '../constants/keys';
import { ComponentSets } from '../types/chat';
import emojiKey from '../constants/emojis';

export async function loadComponentSets(): Promise<ComponentSets> {
  const allNodes = figma.root.findAll();
  const localComponentSets = allNodes.filter((node) => node.type === 'COMPONENT_SET');

  // console.log(
  //   'Local components:',
  //   allNodes
  //     .filter((node) => node.type === 'COMPONENT')
  //     .map((node) => ({
  //       type: node.type,
  //       name: node.name,
  //       key: 'key' in node ? node.key : undefined,
  //     }))
  // );

  // console.log(
  //   'Local component sets:',
  //   localComponentSets.map((set) => ({
  //     name: set.name,
  //     key: set.key,
  //     description: set.description,
  //   }))
  // );

  // Find and log components that start with System or iMessage
  const systemComponents = allNodes.filter(
    (node) =>
      (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') &&
      (node.name.startsWith('System') || node.name.startsWith('iMessage'))
  );
  console.log(
    'System/iMessage components:',
    systemComponents.map((component) => ({
      type: component.type,
      name: component.name,
      key: 'key' in component ? component.key : undefined,
      id: component.id,
    }))
  );

  const componentKeys = [
    libraryComponentKey.senderBubble.key,
    libraryComponentKey.recipientBubble.key,
    libraryComponentKey.statusBanner.key,
    libraryComponentKey.timestamp.key,
  ];

  const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const hasChatBuilderLibrary = collections.some((collection) => collection.libraryName === 'iMessage Chat Builder');

  if (!hasChatBuilderLibrary) {
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

  if (hasChatBuilderLibrary) {
    const allNodes = figma.root.findAll();
    const localComponents = allNodes.filter(
      (node) =>
        (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') &&
        (node.name.startsWith('System') || node.name.startsWith('iMessage'))
    );

    // First, find the color heart component to use as reference
    const colorHeart = localComponents.find((component) => component.name.includes('/Color/Heart'));
    const colorHeartKey = colorHeart && 'key' in colorHeart ? colorHeart.key : undefined;
    const colorHeartId = colorHeart?.id;

    // If we found the color heart, add it to all three styles
    if (colorHeartKey && colorHeartId) {
      ['color', 'transparentBlue', 'transparentGreen'].forEach((style) => {
        if (!emojiKey[style]) {
          emojiKey[style] = {};
        }
        emojiKey[style].heart = {
          key: colorHeartKey,
          id: colorHeartId,
        };
      });
    }

    const promises: Promise<void>[] = localComponents.map(async (component) => {
      if (!('key' in component)) return;

      // Transform name from 'iMessage/Color/Heart' to 'color.heart'
      const nameParts = component.name.split('/');
      if (nameParts.length < 3) return;

      let style = nameParts[1].toLowerCase(); // 'Color' -> 'color'
      // Transform specific style names
      if (style === 'transparent android') style = 'transparentGreen';
      if (style === 'transparent ios') style = 'transparentBlue';

      let emojiName = nameParts[2].toLowerCase(); // 'Heart' -> 'heart'
      // Transform specific emoji names
      if (emojiName === 'thumbs up') emojiName = 'thumbsUp';
      if (emojiName === 'thumbs down') emojiName = 'thumbsDown';

      // Skip heart as it's already been added
      if (emojiName === 'heart') return;

      if (!emojiKey[style]) {
        emojiKey[style] = {};
      }

      try {
        const importedComponent = await figma.importComponentByKeyAsync(component.key);
        emojiKey[style][emojiName] = {
          key: component.key,
          id: importedComponent.id || component.id, // Use imported ID if available, otherwise use original ID
        };
      } catch (error) {
        // If import fails, use the original component's ID
        emojiKey[style][emojiName] = {
          key: component.key,
          id: component.id,
        };
      }
    });

    await Promise.all(promises);
    return;
  }

  // Original library-based logic
  const promises: Promise<void>[] = Object.entries(emojiKey).flatMap(([style, emojis]) =>
    Object.entries(emojis).map(async ([key, value]) => {
      try {
        const component: ComponentNode = await figma.importComponentByKeyAsync(value.key);
        emojiKey[style][key].id = component.id;
      } catch (error) {
        console.error(`Failed to import component for ${style}.${key}`);
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
