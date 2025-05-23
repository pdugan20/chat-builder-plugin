import { BUBBLE_PROPERTIES, THREAD_PROPERTIES, VARIABLES } from '../constants/components';
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
import MODE_ID from '../constants/collections';
import { DEVICE_WIDTH, FRAME_OFFSETS } from '../constants/dimensions';
import buildPrototype from './build-prototype';

// Track the original x position
let originalX = 0;

function findThreadComponentSet(): ComponentSetNode | undefined {
  const allNodes = figma.root.findAll();
  return allNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Thread') as
    | ComponentSetNode
    | undefined;
}

function findThreadVariant(threadComponentSet: ComponentSetNode): ComponentNode | undefined {
  const variants = threadComponentSet.children as ComponentNode[];
  return variants.find((variant) => variant.name === THREAD_PROPERTIES.VARIANT);
}

function createFrameComponent(tempFrame: FrameNode): ComponentNode {
  const frameComponent = figma.createComponent();
  frameComponent.name = tempFrame.name;
  frameComponent.resize(tempFrame.width, tempFrame.height);

  // Clone children
  tempFrame.children.forEach((child) => {
    if ('clone' in child) {
      const childClone = child.clone();
      frameComponent.appendChild(childClone);
    }
  });

  // Copy properties
  frameComponent.layoutMode = tempFrame.layoutMode;
  frameComponent.primaryAxisSizingMode = tempFrame.primaryAxisSizingMode;
  frameComponent.counterAxisSizingMode = tempFrame.counterAxisSizingMode;
  frameComponent.paddingLeft = tempFrame.paddingLeft;
  frameComponent.paddingRight = tempFrame.paddingRight;
  frameComponent.paddingTop = tempFrame.paddingTop;
  frameComponent.paddingBottom = tempFrame.paddingBottom;
  frameComponent.itemSpacing = tempFrame.itemSpacing;

  return frameComponent;
}

function handleEmojiReaction(instance: InstanceNode, props: MessageInstanceProps): void {
  if (instance.exposedInstances.length > 0 && props.emojiReaction) {
    const emojiInstance: InstanceNode = instance.exposedInstances[0];
    const emojiStyle = props.role === 'sender' ? 'color' : 'transparentBlue';
    const emoji = emojiKey[emojiStyle]?.[props.emojiReaction];

    if (props.role === 'recipient') {
      emojiInstance.setProperties({ Style: props.bubbleStyle });
    }

    if (emoji?.id) {
      emojiInstance.setProperties({
        [BUBBLE_PROPERTIES.EMOJI]: emoji.id,
      });
    }
  }
}

function setMessageGroupProperties(
  instance: InstanceNode,
  props: MessageInstanceProps,
  bubbleKeys: string[],
  chatItems: ChatItem[]
): void {
  for (let i: number = 0; i < props.messagesInGroup; i += 1) {
    const message = chatItems[props.index + i]?.message;
    if (message) {
      // Find text nodes in the instance
      const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];

      // Try to find a text node that might be for the message
      const messageNode = textNodes.find(
        (node) =>
          node.name.toLowerCase().includes('message') ||
          node.name.toLowerCase().includes('bubble') ||
          node.name.toLowerCase().includes('text')
      );

      if (messageNode) {
        messageNode.characters = message;
      }
      props.messages.push(message);
    }
  }
}

function createSenderInstance(props: MessageInstanceProps, chatItems: ChatItem[]): InstanceNode {
  const instance: InstanceNode = props.componentSet.defaultVariant.createInstance();
  const availableProps = props.componentSet.componentPropertyDefinitions;

  // Set basic properties
  const properties: Record<string, string> = {
    Bubbles: props.messagesInGroup.toString(),
    Style: props.bubbleStyle,
    'Has reaction': props.emojiReaction ? 'Yes' : 'No',
    'Has mustache text': 'No',
  };

  // Only set properties that exist in the component
  Object.entries(properties).forEach(([key, value]) => {
    if (key in availableProps) {
      instance.setProperties({ [key]: value });
    }
  });

  // Set the first message
  const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
  const messageNode = textNodes.find(
    (node) =>
      node.name.toLowerCase().includes('message') ||
      node.name.toLowerCase().includes('bubble') ||
      node.name.toLowerCase().includes('text')
  );

  if (messageNode) {
    messageNode.characters = props.message;
  }

  setMessageGroupProperties(instance, props, [], chatItems);
  handleEmojiReaction(instance, props);

  if (props.index === chatItems.length - 1) {
    const mustacheProps = {
      'Has mustache text': 'Yes',
      'Mustache#129:16': 'Delivered Quietly',
    };

    // Only set mustache properties that exist
    Object.entries(mustacheProps).forEach(([key, value]) => {
      if (key in availableProps) {
        instance.setProperties({ [key]: value });
      }
    });
  }

  return instance;
}

function createRecipientInstance(props: MessageInstanceProps, chatItems: ChatItem[]): InstanceNode {
  // Get the recipient component set
  const recipientSet = props.componentSet;

  // Create instance from the recipient component set
  const instance: InstanceNode = recipientSet.defaultVariant.createInstance();
  const availableProps = recipientSet.componentPropertyDefinitions;

  // Set basic properties
  const properties: Record<string, string> = {
    Bubbles: props.messagesInGroup.toString(),
    'Has reaction': props.emojiReaction ? 'Yes' : 'No',
    'Has mustache text': 'No',
  };

  // Only set properties that exist in the component
  Object.entries(properties).forEach(([key, value]) => {
    if (key in availableProps) {
      instance.setProperties({ [key]: value });
    }
  });

  // Set the first message
  const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
  const messageNode = textNodes.find(
    (node) =>
      node.name.toLowerCase().includes('message') ||
      node.name.toLowerCase().includes('bubble') ||
      node.name.toLowerCase().includes('text')
  );

  if (messageNode) {
    messageNode.characters = props.message;
  }

  setMessageGroupProperties(instance, props, [], chatItems);
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

function setFrameThemeAndBackground(frame: FrameNode | ComponentNode, theme: 'light' | 'dark'): void {
  const localCollections = figma.variables.getLocalVariableCollections();
  const localColorCollection = localCollections.find((c) => c.name === 'Color');

  if (localColorCollection) {
    // Set the variable mode
    frame.setExplicitVariableModeForCollection(localColorCollection, MODE_ID[theme]);

    // Get and set the background color
    const variables = localColorCollection.variableIds.map((id) => figma.variables.getVariableById(id));
    const threadBackground = variables.find((v) => v.name === VARIABLES.THREAD_BACKGROUND);

    if (threadBackground) {
      frame.fills = [
        figma.variables.setBoundVariableForPaint(
          { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
          'color',
          threadBackground
        ),
      ];
    }
  }
}

export default async function buildChatUserInterface({
  theme = 'light',
  width = DEVICE_WIDTH,
  itemSpacing = 8,
  bubbleStyle = 'iOS',
  name,
  data,
  includePrototype = false,
}: BuildChatUserInterfaceProps): Promise<void> {
  const messages: string[] = [];
  const items = data;
  const { senderSet, recipientSet, statusSet, timestampSet } = await loadComponentSets();
  const tempFrame: FrameNode = await buildFrame(theme, width, itemSpacing, name);

  // Create and append timestamp
  const { date, time } = getFirstChatItemDateTime(items);
  const timestampInstance = await createTimestampInstance(timestampSet, date, time);

  tempFrame.appendChild(timestampInstance);
  timestampInstance.layoutSizingHorizontal = 'FILL';

  // Update emoji IDs
  await updateEmojiKeyIds();

  // Create and append messages
  const messagePromises = items.map(async (item: ChatItem, index: number) => {
    const componentSet = item.role === 'sender' ? senderSet : recipientSet;
    const messageInstance = await createMessageInstance(item, index, componentSet, bubbleStyle, messages, items);

    if (messageInstance) {
      tempFrame.appendChild(messageInstance);
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

  tempFrame.appendChild(statusInstance);
  statusInstance.layoutSizingHorizontal = 'FILL';

  await Promise.all(messagePromises);

  // Find the Thread component set
  const threadComponentSet = findThreadComponentSet();
  if (!threadComponentSet) return;

  // Get the Type=1:1 variant
  const threadVariant = findThreadVariant(threadComponentSet);
  if (!threadVariant) return;

  // Create the frame component
  const frameComponent = createFrameComponent(tempFrame);
  frameComponent.x = originalX;

  originalX += includePrototype ? FRAME_OFFSETS.WITH_PROTOTYPE : FRAME_OFFSETS.WITHOUT_PROTOTYPE;

  // Set theme and background on the frame component
  setFrameThemeAndBackground(frameComponent, theme);

  if (includePrototype) {
    await buildPrototype(frameComponent, threadVariant, items, theme);
  } else {
    // Focus viewport on the new components
    figma.viewport.scrollAndZoomIntoView([frameComponent]);
  }

  // Clean up temporary components
  tempFrame.remove();
}
