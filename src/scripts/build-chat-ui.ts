import chatData from '../constants/test-data';
import { componentKey, componentPropertyName } from '../constants/keys';
import flipHorizontal from '../utils/transform';
import emojiKey from '../constants/emojis';
import { colorCollection, modeId } from '../constants/collections';
import colors from '../constants/colors';

interface BuildChatUserInterfaceProps {
  theme?: 'light' | 'dark';
  data: string;
  width?: number;
  itemSpacing?: number;
  bubbleStyle?: 'iOS' | 'Android';
  name?: string;
}

async function setFrameBackgroundFill(frame: FrameNode) {
  const threadBackground = await figma.variables.getVariableByIdAsync(colors['Background/General/Thread'].id);

  frame.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', threadBackground),
  ];
}

async function setFrameStyle(frame: FrameNode, theme: 'light' | 'dark'): Promise<void> {
  const collection = await figma.variables.getVariableCollectionByIdAsync(colorCollection.id);
  frame.setExplicitVariableModeForCollection(collection, modeId[theme]);
}

async function resizeFrame(frame: FrameNode, width: number): Promise<void> {
  frame.resize(width, frame.height);
}

let lastFrameX: number = 0;
const frameSpacing: number = 50;

function positionFrame(frame: FrameNode, width: number): void {
  const currentFrame = frame;

  currentFrame.x = lastFrameX;
  currentFrame.y = 0;

  lastFrameX += width + frameSpacing;
}

async function buildFrame(
  theme: 'light' | 'dark',
  width: number,
  itemSpacing: number,
  name: string
): Promise<FrameNode> {
  const frame: FrameNode = figma.createFrame();

  positionFrame(frame, width);

  await setFrameStyle(frame, theme);
  await resizeFrame(frame, width);
  await setFrameBackgroundFill(frame);

  frame.name = `Chat thread: ${name}`;
  frame.layoutMode = 'VERTICAL';
  frame.itemSpacing = itemSpacing;

  return frame;
}

async function loadBubbleSets(): Promise<{ senderSet: ComponentSetNode; recipientSet: ComponentSetNode }> {
  const senderSetPromise: Promise<ComponentSetNode> = figma.importComponentSetByKeyAsync(componentKey.senderBubble);
  const recipientSetPromise: Promise<ComponentSetNode> = figma.importComponentSetByKeyAsync(
    componentKey.recipientBubble
  );
  const [senderSet, recipientSet]: [ComponentSetNode, ComponentSetNode] = await Promise.all([
    senderSetPromise,
    recipientSetPromise,
  ]);

  return { senderSet, recipientSet };
}

async function updateEmojiKeyIds(): Promise<void> {
  const promises: Promise<void>[] = Object.entries(emojiKey).flatMap(([style, emojis]) =>
    Object.entries(emojis).map(async ([key, value]) => {
      const component: ComponentNode = await figma.importComponentByKeyAsync(value.key);
      emojiKey[style][key].id = component.id;
    })
  );

  await Promise.all(promises);
}

export default async function buildChatUserInterface({
  theme = 'light',
  width = 402,
  itemSpacing = 8,
  bubbleStyle = 'iOS',
  name,
}: BuildChatUserInterfaceProps): Promise<void> {
  const messages: string[] = [];

  const frame: FrameNode = await buildFrame(theme, width, itemSpacing, name);
  const { senderSet, recipientSet } = await loadBubbleSets();

  await updateEmojiKeyIds();

  const chatUserInterfaceDidDraw = chatData.map(async (item: unknown, index: number): Promise<void> => {
    const {
      role,
      message,
      emojiReaction,
      messagesInGroup,
    }: { role: string; message: string; emojiReaction: string | null; messagesInGroup: number } = item as {
      role: string;
      message: string;
      emojiReaction: string | null;
      messagesInGroup: number;
    };

    const bubbleKeys: string[] =
      role === 'sender' ? componentPropertyName.senderBubble : componentPropertyName.recipientBubble;
    const bubble: string = bubbleKeys[0];

    if (!messages.includes(message)) {
      const hasReaction = emojiReaction ? 'Yes' : 'No';

      if (role === 'sender') {
        const senderInstance: InstanceNode = senderSet.defaultVariant.createInstance();

        senderInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          Style: bubbleStyle,
          'Has reaction': hasReaction,
          'Has mustache text': 'No',
          [bubble]: message,
        });

        for (let i: number = 0; i < messagesInGroup; i += 1) {
          const bubbleKey: string = bubbleKeys[i];
          if (bubbleKey && chatData[index + i]) {
            senderInstance.setProperties({
              [bubbleKey]: chatData[index + i].message,
            });
            messages.push(chatData[index + i].message);
          }
        }

        if (senderInstance.exposedInstances.length > 0) {
          const emojiInstance: InstanceNode = senderInstance.exposedInstances[0];

          emojiInstance.setProperties({
            [componentPropertyName.emoji]: emojiKey.color[emojiReaction].id,
          });
        }

        messages.push(message);
        senderInstance.resize(width, senderInstance.height);
        frame.appendChild(senderInstance);
      }

      if (role === 'recipient') {
        const recipientInstance: InstanceNode = recipientSet.defaultVariant.createInstance();

        recipientInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          'Is group chat': 'No',
          'Has reaction': hasReaction,
          'Has mustache text': 'No',
          [bubble]: message,
        });

        for (let i: number = 0; i < messagesInGroup; i += 1) {
          const bubbleKey: string = bubbleKeys[i];
          if (bubbleKey && chatData[index + i]) {
            recipientInstance.setProperties({
              [bubbleKey]: chatData[index + i].message,
            });
            messages.push(chatData[index + i].message);
          }
        }

        if (recipientInstance.exposedInstances.length > 0) {
          const emojiInstance: InstanceNode = recipientInstance.exposedInstances[0];

          emojiInstance.setProperties({
            Style: bubbleStyle,
            [componentPropertyName.emoji]: emojiKey.transparentBlue[emojiReaction].id,
          });
        }

        messages.push(message);

        recipientInstance.relativeTransform = flipHorizontal(recipientInstance);
        recipientInstance.resize(width, recipientInstance.height);

        frame.appendChild(recipientInstance);
      }
    }
  });

  await Promise.all(chatUserInterfaceDidDraw);
  figma.viewport.scrollAndZoomIntoView([frame]);
}
