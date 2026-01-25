import {
  BUBBLE_PROPERTIES,
  THREAD_PROPERTIES,
  VARIABLES,
  COMPONENT_NAMES,
  PROPERTY_VALUES,
  VARIABLE_COLLECTIONS,
  CHAT_ROLES,
} from '../constants/components';
import { MUSTACHE_TEXT_VALUES } from '../constants/strings';
import flipHorizontal from '../utils/transform';
import emojiKey, { EMOJI_STYLES } from '../constants/emojis';
import { ChatItem, BuildChatUserInterfaceProps } from '../types/chat';
import { MessageInstanceProps } from '../types/chat/components';
import { buildFrame } from '../utils/frame';
import {
  getFirstChatItemDateTime,
  isLastChatItemSender,
  getRecipientName,
  isGroupChat,
  getFirstName,
} from '../utils/chat';
import { clearPersonaCache } from '../utils/persona';
import { yieldToMainThread } from '../utils/yield';
import { NODE_MATCHERS } from '../utils/node-finder';
import {
  loadComponentSets,
  updateEmojiKeyIds,
  createTimestampInstance,
  createStatusInstance,
  findComponentSet,
  findComponentVariant,
  safeSetProperties,
  setPersonaForInstance,
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
    } else if (node.type === 'FRAME' && node.name === COMPONENT_NAMES.PROTOTYPE) {
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
    const emojiStyle = props.role === CHAT_ROLES.SENDER ? EMOJI_STYLES.COLOR : EMOJI_STYLES.TRANSPARENT_BLUE;
    const emoji = emojiKey[emojiStyle]?.[props.emojiReaction];

    if (props.role === CHAT_ROLES.RECIPIENT) {
      emojiInstance.setProperties({ Style: props.bubbleStyle });
    }

    if (emoji?.id) {
      emojiInstance.setProperties({
        [BUBBLE_PROPERTIES.EMOJI]: emoji.id,
      });
    }
  }
}

function setMessageGroupProperties(instance: InstanceNode, props: MessageInstanceProps, chatItems: ChatItem[]): void {
  // Find all text nodes in the instance
  const allTextNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];

  // Filter out the Sender Name node and only get Message Text nodes
  const messageTextNodes = allTextNodes.filter(NODE_MATCHERS.messageText(COMPONENT_NAMES.MESSAGE_TEXT));

  // Sort text nodes by their y position to maintain order
  const sortedTextNodes = messageTextNodes.sort((a, b) => a.y - b.y);

  for (let i: number = 0; i < props.messagesInGroup; i += 1) {
    const message = chatItems[props.index + i]?.message;
    if (message && sortedTextNodes[i]) {
      sortedTextNodes[i].characters = message;
    }
  }
}

async function setRecipientPersona(
  instance: InstanceNode,
  props: MessageInstanceProps,
  chatItems: ChatItem[]
): Promise<void> {
  // Find the current recipient's gender from the chat data
  const currentRecipient = chatItems.find(
    (item) => item.name === props.senderName && item.role === CHAT_ROLES.RECIPIENT
  );
  if (!currentRecipient) return;

  await setPersonaForInstance(instance, currentRecipient.name, currentRecipient.gender);
}

async function createSenderInstance(props: MessageInstanceProps, chatItems: ChatItem[]): Promise<InstanceNode> {
  const instance: InstanceNode = props.componentSet.defaultVariant.createInstance();
  const availableProps = props.componentSet.componentPropertyDefinitions;

  // Detect if it's a group chat
  const groupChat = isGroupChat(chatItems);

  // Set basic properties
  const properties: Record<string, string> = {
    [BUBBLE_PROPERTIES.NUM_BUBBLES]: props.messagesInGroup.toString(),
    Style: props.bubbleStyle,
    [BUBBLE_PROPERTIES.HAS_REACTION]: props.emojiReaction ? PROPERTY_VALUES.YES : PROPERTY_VALUES.NO,
    [BUBBLE_PROPERTIES.HAS_MUSTACHE_TEXT]: PROPERTY_VALUES.NO,
  };

  // Set "Is group chat" property for sender bubbles too
  if (groupChat && BUBBLE_PROPERTIES.IS_GROUP_CHAT in availableProps) {
    properties[BUBBLE_PROPERTIES.IS_GROUP_CHAT] = PROPERTY_VALUES.YES;
  }

  // Use safe property setter
  await safeSetProperties(instance, properties);

  // Set the first message
  const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
  const messageNode = textNodes.find(NODE_MATCHERS.messageText(''));

  if (messageNode) {
    messageNode.characters = props.message;
  }

  setMessageGroupProperties(instance, props, chatItems);
  handleEmojiReaction(instance, props);

  // Check if this bubble contains the very last message in the chat
  const isLastMessageInChat = props.index + props.messagesInGroup - 1 === chatItems.length - 1;

  if (isLastMessageInChat) {
    // Detect if it's a group chat to determine the delivery message
    const deliveryIsGroupChat = isGroupChat(chatItems);

    const mustacheProps = {
      [BUBBLE_PROPERTIES.HAS_MUSTACHE_TEXT]: PROPERTY_VALUES.YES,
      [BUBBLE_PROPERTIES.MUSTACHE_TEXT]: deliveryIsGroupChat
        ? MUSTACHE_TEXT_VALUES.DELIVERED
        : MUSTACHE_TEXT_VALUES.DELIVERED_QUIETLY,
    };

    await safeSetProperties(instance, mustacheProps);
  }

  return instance;
}

async function createRecipientInstance(
  props: MessageInstanceProps,
  chatItems: ChatItem[],
  groupChat: boolean
): Promise<InstanceNode> {
  // Get the recipient component set
  const recipientSet = props.componentSet;

  // Create instance from the recipient component set
  const instance: InstanceNode = recipientSet.defaultVariant.createInstance();
  const availableProps = recipientSet.componentPropertyDefinitions;

  // Set basic properties
  const properties: Record<string, string> = {
    [BUBBLE_PROPERTIES.NUM_BUBBLES]: props.messagesInGroup.toString(),
    [BUBBLE_PROPERTIES.HAS_REACTION]: props.emojiReaction ? PROPERTY_VALUES.YES : PROPERTY_VALUES.NO,
    [BUBBLE_PROPERTIES.HAS_MUSTACHE_TEXT]: PROPERTY_VALUES.NO,
  };

  if (groupChat && BUBBLE_PROPERTIES.IS_GROUP_CHAT in availableProps) {
    properties[BUBBLE_PROPERTIES.IS_GROUP_CHAT] = PROPERTY_VALUES.YES;
  }

  await safeSetProperties(instance, properties);
  setMessageGroupProperties(instance, props, chatItems);

  // Then set the recipient name for group chats AFTER messages are set
  if (groupChat && props.senderName) {
    const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
    const nameNode = textNodes.find((node) => node.name === COMPONENT_NAMES.SENDER_NAME);

    if (nameNode) {
      // Extract first name only for display
      nameNode.characters = getFirstName(props.senderName);
    }
  }

  // Set the profile photo based on recipient's gender
  await setRecipientPersona(instance, props, chatItems);
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

  // Skip this message if it's not the first message in a group
  if (messagesInGroup > 1 && index > 0) {
    const prevItem = chatItems[index - 1];
    if (prevItem && prevItem.role === role && prevItem.name === name && prevItem.messagesInGroup > 1) {
      return null; // This is a continuation of the previous message group
    }
  }

  if (messages.includes(message)) {
    return null;
  }

  // Detect if it's a group chat
  const messageIsGroupChat = isGroupChat(chatItems);

  // For message groups, check if ANY message in the group has an emoji reaction
  let groupEmojiReaction = emojiReaction;
  if (messagesInGroup > 1) {
    // Look ahead in the chat items to find any emoji reactions
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
    role === CHAT_ROLES.SENDER
      ? await createSenderInstance(props, chatItems)
      : await createRecipientInstance(props, chatItems, messageIsGroupChat);

  // Hide instance immediately
  if (instance) {
    instance.visible = false;
  }

  messages.push(message);
  return instance;
}

async function setFrameThemeAndBackground(frame: FrameNode | ComponentNode, theme: 'light' | 'dark'): Promise<void> {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const localColorCollection = localCollections.find((c) => c.name === VARIABLE_COLLECTIONS.COLOR_COLLECTION);

  if (localColorCollection) {
    frame.setExplicitVariableModeForCollection(localColorCollection, MODE_ID[theme]);

    // Get and set the background color
    const variablePromises = localColorCollection.variableIds.map((id) => figma.variables.getVariableByIdAsync(id));
    const variables = await Promise.all(variablePromises);
    const threadBackground = variables.find((v) => v !== null && v.name === VARIABLES.THREAD_BACKGROUND);

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
  // Clear persona cache for fresh assignments in this chat
  clearPersonaCache();

  // Get the correct position for this new chat
  originalX = getNextChatPosition();

  const messages: string[] = [];
  const items = data;
  const { senderSet, recipientSet, statusSet, timestampSet } = await loadComponentSets();
  const tempFrame: FrameNode = await buildFrame(theme, width, itemSpacing, name || 'Chat');

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
    const componentSet = item.role === CHAT_ROLES.SENDER ? senderSet : recipientSet;
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
    messageInstance.visible = true;
  });

  // Create and append status - but only for 1:1 chats
  const groupChat = isGroupChat(items);

  if (!groupChat) {
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
  const threadComponentSet = findComponentSet(COMPONENT_NAMES.THREAD);
  if (!threadComponentSet) return;

  // Get the appropriate variant (1:1 or Group)
  let threadVariant: ComponentNode | undefined;
  if (groupChat) {
    threadVariant = findComponentVariant(threadComponentSet, THREAD_PROPERTIES.VARIANT_GROUP);
  } else {
    threadVariant = findComponentVariant(threadComponentSet, THREAD_PROPERTIES.VARIANT);
  }

  if (!threadVariant) {
    figma.ui.postMessage({
      type: MESSAGE_TYPE.POST_API_ERROR,
      error: `Could not find thread variant: ${groupChat ? 'Group' : '1:1'}`,
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
    await buildPrototype(frameComponent, threadVariant, items, theme, groupChat);

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
