import { BUBBLE_PROPERTIES, THREAD_PROPERTIES, VARIABLES } from '../constants/components';
import flipHorizontal from '../utils/transform';
import emojiKey from '../constants/emojis';
import { ChatItem, BuildChatUserInterfaceProps } from '../types/chat';
import { MessageInstanceProps } from '../types/chat/components';
import { buildFrame } from '../utils/frame';
import { getFirstChatItemDateTime, isLastChatItemSender, getRecipientName } from '../utils/chat';
import { yieldToMainThread } from '../utils/yield';
import getPersonaForRecipient from '../utils/persona';
import {
  loadComponentSets,
  updateEmojiKeyIds,
  createTimestampInstance,
  createStatusInstance,
} from '../services/component';
import MODE_ID from '../constants/collections';
import { DEVICE_WIDTH, FRAME_OFFSET } from '../constants/dimensions';
import buildPrototype from './build-prototype';
import COLORS from '../constants/colors';
import { MESSAGE_TYPE } from '../constants/messages';

// Track the original x position - initialize to viewport center or find rightmost component
let originalX = 0;

function getNextChatPosition(): number {
  // Find all existing components and prototype frames on the page to position new ones to the right
  const allNodes = figma.currentPage.children;
  let rightmostX = -Infinity;

  allNodes.forEach((node) => {
    let rightEdge = -Infinity;

    if (node.type === 'COMPONENT') {
      rightEdge = node.x + node.width;
    } else if (node.type === 'FRAME' && node.name === 'Prototype') {
      rightEdge = node.x + node.width;
    }

    if (rightEdge > rightmostX) {
      rightmostX = rightEdge;
    }
  });

  // If no existing components or prototypes found, start at origin, otherwise add spacing
  if (rightmostX === -Infinity) {
    return 0;
  }
  return rightmostX + 200;
}

// Cache for component sets to avoid repeated traversals
const componentSetCache = new Map<string, ComponentSetNode>();

function findThreadComponentSet(): ComponentSetNode | undefined {
  // Check cache first
  if (componentSetCache.has('Thread')) {
    return componentSetCache.get('Thread');
  }

  const allNodes = figma.root.findAll();
  const threadSet = allNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Thread') as
    | ComponentSetNode
    | undefined;

  if (threadSet) {
    componentSetCache.set('Thread', threadSet);
  }

  return threadSet;
}

function findThreadVariant(threadComponentSet: ComponentSetNode): ComponentNode | undefined {
  const variants = threadComponentSet.children as ComponentNode[];
  return variants.find((variant) => variant.name === THREAD_PROPERTIES.VARIANT);
}

async function createFrameComponent(tempFrame: FrameNode, x?: number): Promise<ComponentNode> {
  const frameComponent = figma.createComponent();

  // Hide frame component during construction to prevent double-frame visibility
  frameComponent.visible = false;

  // Set position immediately after creation, before any other operations
  if (x !== undefined) {
    frameComponent.x = x;
  }

  frameComponent.name = tempFrame.name;
  frameComponent.resize(tempFrame.width, tempFrame.height);

  // Clone all children at once
  const clonedChildren: SceneNode[] = [];
  tempFrame.children.forEach((child) => {
    if ('clone' in child) {
      clonedChildren.push(child.clone());
    }
  });

  // Yield once before appending
  if (clonedChildren.length > 20) {
    await yieldToMainThread();
  }

  // Append all children at once for cleaner appearance
  clonedChildren.forEach((child) => {
    frameComponent.appendChild(child);
  });

  // Copy properties
  frameComponent.layoutMode = tempFrame.layoutMode;
  frameComponent.primaryAxisSizingMode = tempFrame.primaryAxisSizingMode;
  frameComponent.counterAxisSizingMode = tempFrame.counterAxisSizingMode;
  frameComponent.paddingLeft = tempFrame.paddingLeft;
  frameComponent.paddingRight = tempFrame.paddingRight;
  frameComponent.paddingTop = 0;
  frameComponent.paddingBottom = 0;
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
  // Find all text nodes in the instance
  const allTextNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];

  // Filter out the Sender Name node and only get Message Text nodes
  const messageTextNodes = allTextNodes.filter(
    (node) =>
      node.name === 'Message Text' ||
      node.name.toLowerCase().includes('message') ||
      node.name.toLowerCase().includes('bubble') ||
      node.name.toLowerCase().includes('text')
  );

  // Sort text nodes by their y position to maintain order
  const sortedTextNodes = messageTextNodes.sort((a, b) => a.y - b.y);

  for (let i: number = 0; i < props.messagesInGroup; i += 1) {
    const message = chatItems[props.index + i]?.message;
    if (message && sortedTextNodes[i]) {
      sortedTextNodes[i].characters = message;
      props.messages.push(message);
    }
  }
}

function setRecipientPersona(instance: InstanceNode, props: MessageInstanceProps, chatItems: ChatItem[]): void {
  // Find the current recipient's gender from the chat data
  const currentRecipient = chatItems.find((item) => item.name === props.senderName && item.role === 'recipient');
  if (!currentRecipient) return;

  // Find the Profile Photo component instance in the recipient bubble
  const profilePhoto =
    'findOne' in instance
      ? instance.findOne((node) => node.name === 'Profile Photo' || node.name.toLowerCase().includes('profile'))
      : null;

  if (!profilePhoto) {
    return;
  }

  // Now look for the nested Persona component within the Profile Photo
  const persona =
    'findOne' in profilePhoto
      ? profilePhoto.findOne((node) => node.name === 'Persona' && node.type === 'INSTANCE')
      : null;

  if (!persona || !('setProperties' in persona)) {
    return;
  }

  // Use the same approach as the prototype: find the Persona component set and set mainComponent directly
  const rootNodes = figma.root.findAll();
  const personaSet = rootNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Persona');

  if (!personaSet) {
    return;
  }

  const personaInstance = persona as InstanceNode;
  const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];

  // Use name-based hash to select persona
  const selectedVariant = getPersonaForRecipient(currentRecipient.name, currentRecipient.gender, personaVariants);

  if (selectedVariant) {
    personaInstance.mainComponent = selectedVariant;
  }
}

function createSenderInstance(props: MessageInstanceProps, chatItems: ChatItem[]): InstanceNode {
  const instance: InstanceNode = props.componentSet.defaultVariant.createInstance();
  const availableProps = props.componentSet.componentPropertyDefinitions;

  // Detect if it's a group chat
  const uniqueRecipients = new Set(chatItems.filter((item) => item.role === 'recipient').map((item) => item.name));
  const isGroupChat = uniqueRecipients.size > 1;

  // Set basic properties
  const properties: Record<string, string> = {
    Bubbles: props.messagesInGroup.toString(),
    Style: props.bubbleStyle,
    'Has reaction': props.emojiReaction ? 'Yes' : 'No',
    'Has mustache text': 'No',
  };

  // Set "Is group chat" property for sender bubbles too
  if (isGroupChat && 'Is group chat' in availableProps) {
    properties['Is group chat'] = 'Yes';
  }

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

  // Check if this bubble contains the very last message in the chat
  const isLastMessageInChat = props.index + props.messagesInGroup - 1 === chatItems.length - 1;

  if (isLastMessageInChat) {
    // Detect if it's a group chat to determine the delivery message
    const deliveryUniqueRecipients = new Set(
      chatItems.filter((chatItem) => chatItem.role === 'recipient').map((chatItem) => chatItem.name)
    );
    const deliveryIsGroupChat = deliveryUniqueRecipients.size > 1;

    const mustacheProps = {
      'Has mustache text': 'Yes',
      'Mustache#129:16': deliveryIsGroupChat ? 'Delivered' : 'Delivered Quietly',
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

function createRecipientInstance(
  props: MessageInstanceProps,
  chatItems: ChatItem[],
  isGroupChat: boolean
): InstanceNode {
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

  // Set "Is group chat" property if it's a group chat
  if (isGroupChat && 'Is group chat' in availableProps) {
    properties['Is group chat'] = 'Yes';
  }

  // Only set properties that exist in the component
  Object.entries(properties).forEach(([key, value]) => {
    if (key in availableProps) {
      instance.setProperties({ [key]: value });
    }
  });

  // Set message group properties first (this handles multiple messages)
  setMessageGroupProperties(instance, props, [], chatItems);

  // Then set the recipient name for group chats AFTER messages are set
  if (isGroupChat && props.senderName) {
    const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
    const nameNode = textNodes.find((node) => node.name === 'Sender Name');

    if (nameNode) {
      // Extract first name only for display
      const firstName = props.senderName.split(' ')[0];
      nameNode.characters = firstName;
    }
  }

  // Set the persona/profile photo based on recipient's gender
  setRecipientPersona(instance, props, chatItems);

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
  const { role, message, emojiReaction, messagesInGroup, name } = item;

  if (messages.includes(message)) {
    return null;
  }

  // Detect if it's a group chat by counting unique recipient names
  const messageUniqueRecipients = new Set(
    chatItems.filter((chatItem) => chatItem.role === 'recipient').map((chatItem) => chatItem.name)
  );
  const messageIsGroupChat = messageUniqueRecipients.size > 1;

  // For message groups, check if ANY message in the group has an emoji reaction
  let groupEmojiReaction = emojiReaction;
  if (messagesInGroup > 1) {
    // Look ahead in the chat items to find any emoji reactions in this message group
    for (let i = 0; i < messagesInGroup; i += 1) {
      const groupMessage = chatItems[index + i];
      if (groupMessage && groupMessage.emojiReaction && groupMessage.role === role && groupMessage.name === name) {
        groupEmojiReaction = groupMessage.emojiReaction;
        break;
      }
    }
  }

  const props: MessageInstanceProps = {
    role,
    message,
    emojiReaction: groupEmojiReaction,
    messagesInGroup,
    bubbleStyle,
    index,
    componentSet,
    messages,
    senderName: name, // Pass the sender's name for group chats
  };

  const instance =
    role === 'sender'
      ? createSenderInstance(props, chatItems)
      : createRecipientInstance(props, chatItems, messageIsGroupChat);

  // Hide instance immediately to prevent it from briefly appearing in Figma
  if (instance) {
    instance.visible = false;
  }

  messages.push(message);
  return instance;
}

async function setFrameThemeAndBackground(frame: FrameNode | ComponentNode, theme: 'light' | 'dark'): Promise<void> {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const localColorCollection = localCollections.find((c) => c.name === 'Color');

  if (localColorCollection) {
    // Set the variable mode
    frame.setExplicitVariableModeForCollection(localColorCollection, MODE_ID[theme]);

    // Get and set the background color
    const variablePromises = localColorCollection.variableIds.map((id) => figma.variables.getVariableByIdAsync(id));
    const variables = await Promise.all(variablePromises);
    const threadBackground = variables.find((v) => v.name === VARIABLES.THREAD_BACKGROUND);

    if (threadBackground) {
      frame.fills = [
        figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: COLORS.WHITE }, 'color', threadBackground),
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
  // Get the correct position for this new chat
  originalX = getNextChatPosition();

  const messages: string[] = [];
  const items = data;
  const { senderSet, recipientSet, statusSet, timestampSet } = await loadComponentSets();
  const tempFrame: FrameNode = await buildFrame(theme, width, itemSpacing, name);

  // Hide frame during construction to prevent individual message flashing
  tempFrame.visible = false;

  // Create and append timestamp
  const { date, time } = getFirstChatItemDateTime(items);
  const timestampInstance = await createTimestampInstance(timestampSet, date, time);

  tempFrame.appendChild(timestampInstance);
  timestampInstance.layoutSizingHorizontal = 'FILL';

  // Update emoji IDs
  await updateEmojiKeyIds();

  // Process all messages in parallel but keep them in memory
  const messagePromises = items.map((item: ChatItem, index: number) => {
    const componentSet = item.role === 'sender' ? senderSet : recipientSet;
    return createMessageInstance(item, index, componentSet, bubbleStyle, messages, items);
  });

  // Wait for all messages to be created
  const messageInstances = await Promise.all(messagePromises);

  // Filter out null instances
  const validInstances = messageInstances.filter((instance) => instance !== null) as InstanceNode[];

  // Yield once before batch append
  await yieldToMainThread();

  validInstances.forEach((messageInstance) => {
    tempFrame.appendChild(messageInstance);
    messageInstance.layoutSizingHorizontal = 'FILL';
    // Make visible now that it's properly contained in the frame
    messageInstance.visible = true;
  });

  // Create and append status - but only for 1:1 chats, not group chats
  const uniqueRecipients = new Set(items.filter((item) => item.role === 'recipient').map((item) => item.name));
  const isGroupChat = uniqueRecipients.size > 1;

  if (!isGroupChat) {
    const recipientName = getRecipientName(items);
    const hasAction = isLastChatItemSender(items);
    const statusInstance = await createStatusInstance(
      statusSet,
      `${recipientName} has notifications silenced`,
      hasAction
    );

    tempFrame.appendChild(statusInstance);
    statusInstance.layoutSizingHorizontal = 'FILL';
  }

  // Find the Thread component set
  const threadComponentSet = findThreadComponentSet();
  if (!threadComponentSet) return;

  // Get the appropriate variant (1:1 or Group)
  let threadVariant: ComponentNode | undefined;
  if (isGroupChat) {
    threadVariant = threadComponentSet.children.find(
      (variant) => variant.type === 'COMPONENT' && variant.name === THREAD_PROPERTIES.VARIANT_GROUP
    ) as ComponentNode | undefined;
  } else {
    threadVariant = findThreadVariant(threadComponentSet);
  }

  if (!threadVariant) {
    figma.ui.postMessage({
      type: MESSAGE_TYPE.POST_API_ERROR,
      error: `Could not find thread variant: ${isGroupChat ? 'Group' : '1:1'}`,
      retryable: false,
    });
    return;
  }

  // Yield before heavy frame operations
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0);
  });

  // Create the frame component at the correct position immediately (tempFrame stays hidden)
  const frameComponent = await createFrameComponent(tempFrame, originalX);

  originalX += includePrototype ? FRAME_OFFSET.WITH_PROTOTYPE : FRAME_OFFSET.WITHOUT_PROTOTYPE;

  // Yield before theme setting
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0);
  });

  // Set theme and background on the frame component
  await setFrameThemeAndBackground(frameComponent, theme);

  // Clean up temporary components
  tempFrame.remove();

  // Show the final frame component now that everything is ready
  frameComponent.visible = true;

  if (includePrototype) {
    // Yield before prototype building
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 0);
    });
    await buildPrototype(frameComponent, threadVariant, items, theme, isGroupChat);

    // Signal completion after prototype is built
    figma.ui.postMessage({
      type: MESSAGE_TYPE.BUILD_COMPLETE,
    });
  } else {
    // Yield before viewport operation
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 0);
    });

    // Focus viewport on the new components
    figma.viewport.scrollAndZoomIntoView([frameComponent]);

    // Signal completion after a small delay to ensure UI updates
    setTimeout(() => {
      figma.ui.postMessage({
        type: MESSAGE_TYPE.BUILD_COMPLETE,
      });
    }, 10);
  }
}
