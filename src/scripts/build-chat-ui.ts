import chatData from '../constants/test-data';
import { componentKey, componentPropertyName } from '../constants/keys';
import flipHorizontal from '../utils/transform';
import emojiKey from '../constants/emojis';
import { colorCollection, modeId } from '../constants/collections';

interface BuildChatUserInterfaceProps {
  theme?: string;
  data: string;
  width?: number;
  itemSpacing?: number;
  bubbleStyle?: string;
}

export default async function buildChatUserInterface({
  theme = 'light',
  width = 402,
  itemSpacing = 8,
  bubbleStyle = 'iOS',
}: BuildChatUserInterfaceProps) {
  const senderSet = await figma.importComponentSetByKeyAsync(componentKey.senderBubble);
  const recipientSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);

  const messages = [];
  const frame = figma.createFrame();

  const collection = await figma.variables.getVariableCollectionByIdAsync(colorCollection.id);
  frame.setExplicitVariableModeForCollection(collection, modeId[theme]);

  const threadBackground = await figma.variables.getVariableByIdAsync(
    'VariableID:0598b50981ddea62d9f02f9fc0bfa2612cc9b539/600:7'
  );

  const resolvedValue = threadBackground.resolveForConsumer(frame);
  const { r, g, b, a } = resolvedValue.value as RGBA;

  const solidFill: SolidPaint = {
    type: 'SOLID',
    color: {
      r,
      g,
      b,
    },
    opacity: a,
  };

  frame.fills = [solidFill];
  frame.layoutMode = 'VERTICAL';
  frame.resize(width, frame.height);
  frame.itemSpacing = itemSpacing;

  const emojiKeyUpdatePromises = Object.entries(emojiKey).flatMap(([style, emojis]) =>
    Object.entries(emojis).map(async ([key, value]) => {
      const component = await figma.importComponentByKeyAsync(value.key);
      emojiKey[style][key].id = component.id;
    })
  );

  await Promise.all(emojiKeyUpdatePromises);

  chatData.forEach(async (item, index) => {
    const { role, message, emojiReaction, messagesInGroup } = item;

    const bubbleKeys = role === 'sender' ? componentPropertyName.senderBubble : componentPropertyName.recipientBubble;
    const bubble = bubbleKeys[0];

    if (!messages.includes(message)) {
      const hasReaction = emojiReaction ? 'Yes' : 'No';

      if (role === 'sender') {
        const senderInstance = senderSet.defaultVariant.createInstance();

        senderInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          Style: bubbleStyle,
          'Has reaction': hasReaction,
          'Has mustache text': 'No',
          [bubble]: message,
        });

        for (let i = 0; i < messagesInGroup; i += 1) {
          const bubbleKey = bubbleKeys[i];
          if (bubbleKey && chatData[index + i]) {
            senderInstance.setProperties({
              [bubbleKey]: chatData[index + i].message,
            });
            messages.push(chatData[index + i].message);
          }
        }

        if (senderInstance.exposedInstances.length > 0) {
          const emojiInstance = senderInstance.exposedInstances[0];

          emojiInstance.setProperties({
            [componentPropertyName.emoji]: emojiKey.color[emojiReaction].id,
          });
        }

        messages.push(message);
        senderInstance.resize(width, senderInstance.height);
        frame.appendChild(senderInstance);
      }

      if (role === 'recipient') {
        const recipientInstance = recipientSet.defaultVariant.createInstance();

        recipientInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          'Is group chat': 'No',
          'Has reaction': hasReaction,
          'Has mustache text': 'No',
          [bubble]: message,
        });

        for (let i = 0; i < messagesInGroup; i += 1) {
          const bubbleKey = bubbleKeys[i];
          if (bubbleKey && chatData[index + i]) {
            recipientInstance.setProperties({
              [bubbleKey]: chatData[index + i].message,
            });
            messages.push(chatData[index + i].message);
          }
        }

        if (recipientInstance.exposedInstances.length > 0) {
          const emojiInstance = recipientInstance.exposedInstances[0];

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
}
