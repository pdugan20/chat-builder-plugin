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
  const frame: FrameNode = await buildFrame(theme, width, itemSpacing, name);

  // Create and append timestamp
  const { date, time } = getFirstChatItemDateTime(items);
  const timestampInstance = await createTimestampInstance(timestampSet, date, time);

  frame.appendChild(timestampInstance);
  timestampInstance.layoutSizingHorizontal = 'FILL';

  // Update emoji IDs
  await updateEmojiKeyIds();

  // Create and append messages
  const messagePromises = items.map(async (item: ChatItem, index: number) => {
    const componentSet = item.role === 'sender' ? senderSet : recipientSet;
    const messageInstance = await createMessageInstance(item, index, componentSet, bubbleStyle, messages, items);

    if (messageInstance) {
      frame.appendChild(messageInstance);
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

  frame.appendChild(statusInstance);
  statusInstance.layoutSizingHorizontal = 'FILL';

  await Promise.all(messagePromises);
  figma.viewport.scrollAndZoomIntoView([frame]);

  // Search for Thread component set
  const allNodes = figma.root.findAll();
  const threadComponentSet = allNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Thread');

  if (threadComponentSet) {
    const variants = (threadComponentSet as ComponentSetNode).children as ComponentNode[];
    variants.map((variant) => ({
      name: variant.name,
      key: variant.key,
      description: variant.description,
    }));

    // Find and create instance of Type=1:1 variant
    const type11Variant = variants.find((variant) => variant.name === 'Type=1:1');
    if (type11Variant) {
      // Create a component from the frame
      const frameComponent = figma.createComponent();
      frameComponent.name = frame.name;
      frameComponent.resize(frame.width, frame.height);
      frameComponent.x = originalX;
      originalX += 1104;

      // Clone the frame's children to the component
      frame.children.forEach((child) => {
        if ('clone' in child) {
          const childClone = child.clone();
          frameComponent.appendChild(childClone);
        }
      });

      // Copy the frame's properties to the component
      frameComponent.layoutMode = frame.layoutMode;
      frameComponent.primaryAxisSizingMode = frame.primaryAxisSizingMode;
      frameComponent.counterAxisSizingMode = frame.counterAxisSizingMode;
      frameComponent.paddingLeft = frame.paddingLeft;
      frameComponent.paddingRight = frame.paddingRight;
      frameComponent.paddingTop = frame.paddingTop;
      frameComponent.paddingBottom = frame.paddingBottom;
      frameComponent.itemSpacing = frame.itemSpacing;

      // Set the background color
      frameComponent.fills = frame.fills;

      // Create instance of the component
      const frameInstance = frameComponent.createInstance();
      frameInstance.paddingTop = 142;
      frameInstance.paddingBottom = 82;

      // Create a new component from the Thread variant
      const threadComponent = figma.createComponent();
      threadComponent.name = 'Thread';
      threadComponent.resize(type11Variant.width, type11Variant.height);

      // Clone the variant's children to the component
      type11Variant.children.forEach((child) => {
        if ('clone' in child) {
          const childClone = child.clone();
          threadComponent.appendChild(childClone);
        }
      });

      const navBar = threadComponent.findOne((node) => node.name === 'Thread Navigation Bar');
      if (navBar && 'setProperties' in navBar) {
        (navBar as InstanceNode).setProperties({ 'Chat name#424:0': recipientName });
      }

      const persona = threadComponent.findOne((node) => node.name === 'Persona');
      const rootNodes = figma.root.findAll();
      const personaSet = rootNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Persona');
      if (personaSet) {
        const recipientGender = getRecipientGender(items).charAt(0).toUpperCase() + getRecipientGender(items).slice(1);
        const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];
        const matchingVariants = personaVariants.filter((variant) => variant.name.includes(recipientGender));

        if (matchingVariants.length > 0) {
          const randomVariant = matchingVariants[Math.floor(Math.random() * matchingVariants.length)];
          if (persona && 'setProperties' in persona) {
            (persona as InstanceNode).mainComponent = randomVariant;
          }
        }
      }

      // Find the placeholder in the component
      const placeholder = threadComponent.findOne((node) => node.name === 'PLACEHOLDER_THREAD');
      if (placeholder) {
        // Insert the frame instance into the component
        placeholder.parent?.insertChild(placeholder.parent.children.indexOf(placeholder), frameInstance);
        placeholder.remove();
        frameInstance.y = 0;
      }

      // Create a frame to contain the thread instance
      const prototypeFrame = figma.createFrame();
      prototypeFrame.name = 'Prototype';
      prototypeFrame.resize(threadComponent.width, threadComponent.height);
      prototypeFrame.x = frameComponent.x + frameComponent.width + 50;
      prototypeFrame.y = frameComponent.y;
      prototypeFrame.cornerRadius = 40;

      // Create and add the thread instance to the prototype frame
      const threadInstance = threadComponent.createInstance();
      prototypeFrame.appendChild(threadInstance);

      // Remove the original frame and the Thread component
      frame.remove();
      threadComponent.remove();

      // Resize and zoom viewport to show both frames
      figma.viewport.scrollAndZoomIntoView([frameComponent, prototypeFrame]);
    }
  }
}
