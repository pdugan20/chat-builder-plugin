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
import { DEVICE_WIDTH, FRAME_OFFSET } from '../constants/dimensions';
import buildPrototype from './build-prototype';
import COLORS from '../constants/colors';
import { MESSAGE_TYPE } from '../constants/messages';

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
  console.log(`🎭 Processing emoji reaction for ${props.role}: ${props.emojiReaction}`);
  console.log(`   Exposed instances count: ${instance.exposedInstances.length}`);
  
  if (instance.exposedInstances.length > 0 && props.emojiReaction) {
    const emojiInstance: InstanceNode = instance.exposedInstances[0];
    const emojiStyle = props.role === 'sender' ? 'color' : 'transparentBlue';
    const emoji = emojiKey[emojiStyle]?.[props.emojiReaction];
    
    console.log(`   Emoji style: ${emojiStyle}, Emoji found: ${!!emoji?.id}`);
    if (emoji?.id) {
      console.log(`   Setting emoji ID: ${emoji.id}`);
    }

    if (props.role === 'recipient') {
      emojiInstance.setProperties({ Style: props.bubbleStyle });
    }

    if (emoji?.id) {
      emojiInstance.setProperties({
        [BUBBLE_PROPERTIES.EMOJI]: emoji.id,
      });
      console.log(`✅ Emoji reaction set successfully for ${props.role}`);
    } else {
      console.log(`❌ No emoji ID found for ${props.emojiReaction} with style ${emojiStyle}`);
    }
  } else if (props.emojiReaction) {
    console.log(`❌ No exposed instances found for ${props.role} bubble with reaction ${props.emojiReaction}`);
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
  const messageTextNodes = allTextNodes.filter((node) => 
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
  const currentRecipient = chatItems.find(item => item.name === props.senderName && item.role === 'recipient');
  if (!currentRecipient) return;

  // Find the Profile Photo component instance in the recipient bubble
  const profilePhoto = 'findOne' in instance 
    ? instance.findOne((node) => 
        node.name === 'Profile Photo' || 
        node.name.toLowerCase().includes('profile')
      )
    : null;

  if (!profilePhoto) {
    console.log('No Profile Photo instance found in recipient bubble');
    return;
  }

  // Now look for the nested Persona component within the Profile Photo
  const persona = 'findOne' in profilePhoto 
    ? profilePhoto.findOne((node) => 
        node.name === 'Persona' && node.type === 'INSTANCE'
      )
    : null;

  if (!persona || !('setProperties' in persona)) {
    console.log('No Persona instance found within Profile Photo');
    if ('children' in profilePhoto) {
      console.log('Profile Photo children:', profilePhoto.children.map(child => ({ name: child.name, type: child.type })));
    } else {
      console.log('Profile Photo has no children property');
    }
    return;
  }

  // Use the same approach as the prototype: find the Persona component set and set mainComponent directly
  const rootNodes = figma.root.findAll();
  const personaSet = rootNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Persona');

  if (!personaSet) {
    console.log('No Persona component set found');
    return;
  }

  const personaInstance = persona as InstanceNode;
  const recipientGender = currentRecipient.gender.charAt(0).toUpperCase() + currentRecipient.gender.slice(1);
  const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];
  const matchingVariants = personaVariants.filter((variant) => variant.name.includes(recipientGender));

  if (matchingVariants.length > 0) {
    // Get all unique recipients in this chat to avoid duplicate photos
    const allRecipients = chatItems
      .filter(item => item.role === 'recipient')
      .reduce((unique, item) => {
        if (!unique.some(u => u.name === item.name)) {
          unique.push({ name: item.name, gender: item.gender });
        }
        return unique;
      }, [] as Array<{ name: string; gender: string }>);

    // Sort recipients by name for consistent ordering
    allRecipients.sort((a, b) => a.name.localeCompare(b.name));
    
    // Find which recipient this is (by index) among recipients of the same gender
    const sameGenderRecipients = allRecipients.filter(r => r.gender === currentRecipient.gender);
    const recipientIndex = sameGenderRecipients.findIndex(r => r.name === currentRecipient.name);
    
    // Use the recipient's index to select a variant, cycling through available options
    const variantIndex = recipientIndex % matchingVariants.length;
    const selectedVariant = matchingVariants[variantIndex];
    
    console.log(`Setting nested Persona mainComponent to ${recipientGender} variant: ${selectedVariant.name} for ${props.senderName} (index ${recipientIndex} of ${sameGenderRecipients.length} ${recipientGender.toLowerCase()} recipients)`);
    personaInstance.mainComponent = selectedVariant;
  } else {
    console.log(`No matching persona variants found for ${recipientGender}`);
    console.log('Available variants:', personaVariants.map(v => v.name));
  }
}

function createSenderInstance(props: MessageInstanceProps, chatItems: ChatItem[]): InstanceNode {
  const instance: InstanceNode = props.componentSet.defaultVariant.createInstance();
  const availableProps = props.componentSet.componentPropertyDefinitions;

  // Detect if it's a group chat
  const uniqueRecipients = new Set(chatItems.filter(item => item.role === 'recipient').map(item => item.name));
  const isGroupChat = uniqueRecipients.size > 1;

  console.log('Sender Bubble available properties:', Object.keys(availableProps));
  console.log('Is group chat:', isGroupChat);

  // Set basic properties
  const properties: Record<string, string> = {
    Bubbles: props.messagesInGroup.toString(),
    Style: props.bubbleStyle,
    'Has reaction': props.emojiReaction ? 'Yes' : 'No',
    'Has mustache text': 'No',
  };

  // Set "Is group chat" property for sender bubbles too
  if (isGroupChat && 'Is group chat' in availableProps) {
    console.log('Setting sender "Is group chat" to Yes');
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
    console.log(`📝 Adding delivery status to sender bubble (message group ending at position ${props.index + props.messagesInGroup - 1})`);
    
    // Detect if it's a group chat to determine the delivery message
    const uniqueRecipients = new Set(chatItems.filter(item => item.role === 'recipient').map(item => item.name));
    const isGroupChat = uniqueRecipients.size > 1;
    
    const mustacheProps = {
      'Has mustache text': 'Yes',
      'Mustache#129:16': isGroupChat ? 'Delivered' : 'Delivered Quietly',
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

  // Log available properties to see what's available for group chats
  console.log('Recipient Bubble available properties:', Object.keys(availableProps));
  console.log('Is group chat:', isGroupChat);

  // Set basic properties
  const properties: Record<string, string> = {
    Bubbles: props.messagesInGroup.toString(),
    'Has reaction': props.emojiReaction ? 'Yes' : 'No',
    'Has mustache text': 'No',
  };

  // Set "Is group chat" property if it's a group chat
  if (isGroupChat && 'Is group chat' in availableProps) {
    console.log('Setting "Is group chat" to Yes');
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
  
  console.log(`📨 Processing message ${index + 1}: ${role} - ${name} - "${message}" - emoji: ${emojiReaction}`);

  if (messages.includes(message)) {
    console.log(`⏭️ Skipping duplicate message: "${message}"`);
    return null;
  }

  // Detect if it's a group chat by counting unique recipient names
  const uniqueRecipients = new Set(chatItems.filter((item) => item.role === 'recipient').map((item) => item.name));
  const isGroupChat = uniqueRecipients.size > 1;

  // For message groups, check if ANY message in the group has an emoji reaction
  let groupEmojiReaction = emojiReaction;
  if (messagesInGroup > 1) {
    // Look ahead in the chat items to find any emoji reactions in this message group
    for (let i = 0; i < messagesInGroup; i++) {
      const groupMessage = chatItems[index + i];
      if (groupMessage && groupMessage.emojiReaction && groupMessage.role === role && groupMessage.name === name) {
        groupEmojiReaction = groupMessage.emojiReaction;
        console.log(`🎯 Found emoji reaction "${groupEmojiReaction}" in message group for ${role}`);
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
    role === 'sender' ? createSenderInstance(props, chatItems) : createRecipientInstance(props, chatItems, isGroupChat);

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

  await Promise.all(messagePromises);

  // Find the Thread component set
  const threadComponentSet = findThreadComponentSet();
  if (!threadComponentSet) return;

  // Get the appropriate variant (1:1 or Group)
  let threadVariant: ComponentNode | undefined;
  if (isGroupChat) {
    console.log('Using Group thread variant for', uniqueRecipients.size + 1, 'participants');
    threadVariant = threadComponentSet.children.find(
      (variant) => variant.type === 'COMPONENT' && variant.name === THREAD_PROPERTIES.VARIANT_GROUP
    ) as ComponentNode | undefined;
  } else {
    console.log('Using 1:1 thread variant');
    threadVariant = findThreadVariant(threadComponentSet);
  }

  if (!threadVariant) {
    console.error('Could not find thread variant:', isGroupChat ? 'Group' : '1:1');
    return;
  }

  // Create the frame component
  const frameComponent = createFrameComponent(tempFrame);
  frameComponent.x = originalX;

  originalX += includePrototype ? FRAME_OFFSET.WITH_PROTOTYPE : FRAME_OFFSET.WITHOUT_PROTOTYPE;

  // Set theme and background on the frame component
  await setFrameThemeAndBackground(frameComponent, theme);

  // Clean up temporary components
  tempFrame.remove();

  if (includePrototype) {
    await buildPrototype(frameComponent, threadVariant, items, theme, isGroupChat);
    
    // Signal completion after prototype is built (this happens after "Using Group/1:1 thread variant" logs)
    figma.ui.postMessage({
      type: MESSAGE_TYPE.BUILD_COMPLETE,
    });
  } else {
    // Focus viewport on the new components
    figma.viewport.scrollAndZoomIntoView([frameComponent]);
    
    // For non-prototype builds, signal completion immediately after viewport operation
    figma.ui.postMessage({
      type: MESSAGE_TYPE.BUILD_COMPLETE,
    });
  }
}
