import chatData from '../constants/test-data';
import componentKey from '../constants/keys';

interface BuildChatUserInterfaceProps {
  data: string;
  width?: number;
  itemSpacing?: number;
}

export default async function buildChatUserInterface({
  data,
  width = 402,
  itemSpacing = 8,
}: BuildChatUserInterfaceProps) {
  const senderSet = await figma.importComponentSetByKeyAsync(componentKey.senderBubble);
  const recipientSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);

  // console.log(senderSet.componentPropertyDefinitions);
  // console.log(recipientSet.componentPropertyDefinitions);

  const messages = [];
  const frame = figma.createFrame();

  frame.layoutMode = 'VERTICAL';
  frame.resize(width, frame.height);
  frame.itemSpacing = itemSpacing;

  chatData.forEach((item, index) => {
    const { role, message, messagesInGroup } = item;

    const bubbleKeys =
      role === 'sender'
        ? ['First bubble#80:3', 'Second bubble#80:4', 'Third bubble#80:7']
        : ['First bubble#41:2', 'Second bubble#40:1', 'Third bubble#45:0'];

    const bubble = bubbleKeys[0];

    if (!messages.includes(message)) {
      if (role === 'sender') {
        const senderInstance = senderSet.defaultVariant.createInstance();

        senderInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          Style: 'iOS',
          'Has reaction': 'No',
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

        messages.push(message);
        senderInstance.resize(width, senderInstance.height);
        frame.appendChild(senderInstance);
      }

      if (role === 'recipient') {
        const recipientInstance = recipientSet.defaultVariant.createInstance();

        recipientInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          'Is group chat': 'No',
          'Has reaction': 'No',
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

        const currentTransform = recipientInstance.relativeTransform;
        recipientInstance.relativeTransform = [
          [-1, 0, currentTransform[0][2]], // Flip on y-axis
          [0, 1, currentTransform[1][2]], // Ignore x-axis
        ];

        messages.push(message);
        recipientInstance.resize(width, recipientInstance.height);
        frame.appendChild(recipientInstance);
      }
    }
  });
}
