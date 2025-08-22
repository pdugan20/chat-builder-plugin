import {
  THREAD_COMPONENT_SETS,
  COMPONENT_NAMES,
  BUBBLE_PROPERTIES,
  PROPERTY_VALUES,
  TIMESTAMP_BANNER_PROPERTIES,
  STATUS_BANNER_PROPERTIES,
} from '../constants/components';
import { ComponentSets } from '../types/chat';
import emojiKey, { EMOJI_REACTIONS } from '../constants/emojis';
import {
  findColorHeart,
  addHeartToStyles,
  processComponent,
  transformStyleName,
  transformEmojiName,
} from '../utils/components';
import getPersonaForRecipient from '../utils/persona';
import { NODE_MATCHERS } from '../utils/node-finder';

// Cache for component sets to avoid repeated traversals
const componentSetCache = new Map<string, ComponentSetNode>();

export function findComponentSet(name: string): ComponentSetNode | undefined {
  // Check cache first
  if (componentSetCache.has(name)) {
    return componentSetCache.get(name);
  }

  const allNodes = figma.root.findAll();
  const componentSet = allNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === name) as
    | ComponentSetNode
    | undefined;

  if (componentSet) {
    componentSetCache.set(name, componentSet);
  }

  return componentSet;
}

export function findComponentVariant(componentSet: ComponentSetNode, variantName: string): ComponentNode | undefined {
  const variants = componentSet.children as ComponentNode[];
  return variants.find((variant) => variant.name === variantName);
}

export async function safeSetProperties(instance: InstanceNode, properties: Record<string, string>): Promise<void> {
  try {
    instance.setProperties(properties);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('setProperties failed:', error);
    }
    throw error;
  }
}

export async function loadComponentSets(): Promise<ComponentSets> {
  // Use the new findComponentSet function with caching
  const senderSet = findComponentSet(THREAD_COMPONENT_SETS.SENDER_BUBBLE.name);
  const recipientSet = findComponentSet(THREAD_COMPONENT_SETS.RECIPIENT_BUBBLE.name);
  const statusSet = findComponentSet(THREAD_COMPONENT_SETS.STATUS_BANNER.name);
  const timestampSet = findComponentSet(THREAD_COMPONENT_SETS.TIMESTAMP.name);

  if (!senderSet || !recipientSet || !statusSet || !timestampSet) {
    throw new Error('Could not find all required component sets');
  }

  return { senderSet, recipientSet, statusSet, timestampSet };
}

export async function updateEmojiKeyIds(): Promise<void> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const hasChatBuilderLibrary = collections.some((collection) => collection.name === 'iMessage Chat Builder');

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
    if (emojiName === EMOJI_REACTIONS.HEART) return;

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
    (node: { type: string; name: string }) => node.type === 'TEXT' && node.name === TIMESTAMP_BANNER_PROPERTIES.DATE
  ) as TextNode;
  const timeLabel = timestampInstance.findOne(
    (node: { type: string; name: string }) => node.type === 'TEXT' && node.name === TIMESTAMP_BANNER_PROPERTIES.TIME
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
    (node: { type: string; name: string }) => node.type === 'TEXT' && node.name === STATUS_BANNER_PROPERTIES.BANNER_TEXT
  ) as TextNode;

  if (notificationLabel) {
    notificationLabel.characters = notificationText;
  }

  // Only set the property if it exists in the component
  if (BUBBLE_PROPERTIES.HAS_ACTION in availableProps) {
    statusInstance.setProperties({
      [BUBBLE_PROPERTIES.HAS_ACTION]: hasAction ? PROPERTY_VALUES.YES : PROPERTY_VALUES.NO,
    });
  }

  return statusInstance;
}

export async function setPersonaForInstance(
  instance: InstanceNode | SceneNode,
  recipientName: string,
  recipientGender: string
): Promise<void> {
  // Find the Profile Photo component instance
  const profilePhoto =
    'findOne' in instance ? instance.findOne(NODE_MATCHERS.profilePhoto(COMPONENT_NAMES.PROFILE_PHOTO)) : null;

  if (!profilePhoto) {
    return;
  }

  // Look for the nested Persona component within the Profile Photo
  const persona =
    'findOne' in profilePhoto
      ? profilePhoto.findOne((node) => node.name === COMPONENT_NAMES.PERSONA && node.type === 'INSTANCE')
      : null;

  if (!persona || !('setProperties' in persona)) {
    return;
  }

  // Find the Persona component set
  const personaSet = findComponentSet(COMPONENT_NAMES.PERSONA);
  if (!personaSet) {
    return;
  }

  const personaInstance = persona as InstanceNode;
  const personaVariants = personaSet.children as ComponentNode[];

  // Use existing getPersonaForRecipient utility
  const selectedVariant = getPersonaForRecipient(recipientName, recipientGender, personaVariants);

  if (selectedVariant) {
    personaInstance.mainComponent = selectedVariant;
  }
}
