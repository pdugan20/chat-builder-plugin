import { componentPropertyName } from '../constants/keys';
import flipHorizontal from '../utils/transform';
import emojiKey from '../constants/emojis';
import { ChatItem, BuildChatUserInterfaceProps } from '../types/chat';
import { MessageInstanceProps } from '../types/chat/components';
import { buildFrame } from '../utils/frame';
import { getFirstChatItemDateTime, isLastChatItemSender, getRecipientName, getRecipientGender } from '../utils/chat';
import {
  loadComponentSets,
  updateEmojiKeyIds,
  createTimestampInstance,
  createStatusInstance,
} from '../services/component';

// Track the original x position
let originalX = 0;

function findThreadComponentSet(): ComponentSetNode | undefined {
  const allNodes = figma.root.findAll();
  return allNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Thread') as
    | ComponentSetNode
    | undefined;
}

function findType11Variant(threadComponentSet: ComponentSetNode): ComponentNode | undefined {
  const variants = threadComponentSet.children as ComponentNode[];
  return variants.find((variant) => variant.name === 'Type=1:1');
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
  frameComponent.fills = tempFrame.fills;

  return frameComponent;
}

function setPersonaProperties(tempThreadComponent: ComponentNode, items: ChatItem[]): void {
  const persona = tempThreadComponent.findOne((node) => node.name === 'Persona');
  const rootNodes = figma.root.findAll();
  const personaSet = rootNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Persona');

  if (personaSet && persona && 'setProperties' in persona) {
    const recipientGender = getRecipientGender(items).charAt(0).toUpperCase() + getRecipientGender(items).slice(1);
    const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];
    const matchingVariants = personaVariants.filter((variant) => variant.name.includes(recipientGender));

    if (matchingVariants.length > 0) {
      const randomVariant = matchingVariants[Math.floor(Math.random() * matchingVariants.length)];
      (persona as InstanceNode).mainComponent = randomVariant;
    }
  }
}

function createThreadComponent(threadVariant: ComponentNode, recipientName: string, items: ChatItem[]): ComponentNode {
  const tempThreadComponent = figma.createComponent();
  tempThreadComponent.name = 'Thread';
  tempThreadComponent.resize(threadVariant.width, threadVariant.height);

  // Clone variant children
  threadVariant.children.forEach((child) => {
    if ('clone' in child) {
      const childClone = child.clone();
      tempThreadComponent.appendChild(childClone);
    }
  });

  // Set navigation bar properties
  const navBar = tempThreadComponent.findOne((node) => node.name === 'Thread Navigation Bar');
  if (navBar && 'setProperties' in navBar) {
    (navBar as InstanceNode).setProperties({ 'Chat name#424:0': recipientName });
  }

  // Set persona properties
  setPersonaProperties(tempThreadComponent, items);

  return tempThreadComponent;
}

function createPrototypeFrame(tempThreadComponent: ComponentNode, frameComponent: ComponentNode): FrameNode {
  const prototypeFrame = figma.createFrame();
  prototypeFrame.name = 'Prototype';
  prototypeFrame.resize(tempThreadComponent.width, tempThreadComponent.height);
  prototypeFrame.x = frameComponent.x + frameComponent.width + 50;
  prototypeFrame.y = frameComponent.y;
  prototypeFrame.cornerRadius = 40;

  return prototypeFrame;
}

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
  const threadVariant = findType11Variant(threadComponentSet);
  if (!threadVariant) return;

  // Create the frame component
  const frameComponent = createFrameComponent(tempFrame);
  frameComponent.x = originalX;
  originalX += 1104;

  // Create the thread component
  const tempThreadComponent = createThreadComponent(threadVariant, recipientName, items);

  // Create and position the prototype frame
  const prototypeFrame = createPrototypeFrame(tempThreadComponent, frameComponent);
  const threadInstance = tempThreadComponent.createInstance();
  prototypeFrame.appendChild(threadInstance);

  // Clean up temporary components
  tempFrame.remove();
  tempThreadComponent.remove();

  // Focus viewport on the new components
  figma.viewport.scrollAndZoomIntoView([frameComponent, prototypeFrame]);
}
