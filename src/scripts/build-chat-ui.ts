import chatData from '../constants/test-data';
import componentKey from '../constants/keys';

interface BuildChatUserInterfaceProps {
  data: string;
  width?: number;
}

// Sender
// 'First bubble#80:3'
// 'Second bubble#80:4'
// 'Third bubble#80:7'

// Recipient
// 'First bubble#41:2'
// 'Second bubble#40:1'
// 'Third bubble#45:0'

export default async function buildChatUserInterface({ data, width = 402 }: BuildChatUserInterfaceProps) {
  // eslint-disable-next-line no-console
  // console.log(data);

  const senderSet = await figma.importComponentSetByKeyAsync(componentKey.senderBubble);
  const recipientSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);
  // console.log(recipientSet.componentPropertyDefinitions);

  const frame = figma.createFrame();

  frame.layoutMode = 'VERTICAL';
  frame.resize(width, frame.height);

  // const recipientBubbleSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);
  // console.log(recipientBubbleSet);

  const messages = [];

  chatData.forEach((item, index) => {
    const { role, message, messagesInGroup } = item;

    if (!messages.includes(message)) {
      if (role === 'sender') {
        const senderInstance = senderSet.defaultVariant.createInstance();

        messages.push(message);

        senderInstance.setProperties({
          Bubbles: messagesInGroup.toString(),
          Style: 'iOS',
          'Has reaction': 'No',
          'Has mustache text': 'No',
          'First bubble#80:3': message,
        });

        if (messagesInGroup === 2) {
          senderInstance.setProperties({
            'Second bubble#80:4': chatData[index + 1].message,
          });
          messages.push(chatData[index + 1].message);
        }

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
          'First bubble#41:2': message,
        });

        if (messagesInGroup === 2) {
          recipientInstance.setProperties({
            'Second bubble#40:1': chatData[index + 1].message,
          });
          messages.push(chatData[index + 1].message);
        }

        const currentTransform = recipientInstance.relativeTransform;
        recipientInstance.relativeTransform = [
          [-1, 0, currentTransform[0][2]], // Flip on y-axis
          [0, 1, currentTransform[1][2]], // Ignore x-axis
        ];

        recipientInstance.resize(width, recipientInstance.height);
        frame.appendChild(recipientInstance);
      }
    }
  });
}
