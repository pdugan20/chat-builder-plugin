import chatData from '../constants/test-data';
import componentKey from '../constants/keys';

// 'First bubble#80:3': 'Testing',
// 'Second bubble#80:4': 'Testing',
// 'Third bubble#80:7': 'Testing',

export default async function buildChatUserInterface(data: string) {
  // eslint-disable-next-line no-console
  // console.log(data);

  const senderSet = await figma.importComponentSetByKeyAsync(componentKey.senderBubble);
  const recipientSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);
  // console.log(recipientSet.componentPropertyDefinitions);

  const frame = figma.createFrame();
  frame.layoutMode = 'VERTICAL';
  frame.resize(402, frame.height);

  // const recipientBubbleSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);
  // console.log(recipientBubbleSet);

  chatData.forEach((item) => {
    const { role, message, messagesInGroup } = item;

    if (role === 'sender') {
      const senderInstance = senderSet.defaultVariant.createInstance();

      senderInstance.setProperties({
        Bubbles: '1',
        Style: 'iOS',
        'Has reaction': 'No',
        'Has mustache text': 'No',
        'First bubble#80:3': message,
      });

      senderInstance.resize(402, senderInstance.height);
      frame.appendChild(senderInstance);
    }

    if (role === 'recipient') {
      const recipientInstance = recipientSet.defaultVariant.createInstance();

      recipientInstance.setProperties({
        Bubbles: '1',
        'Is group chat': 'No',
        'Has reaction': 'No',
        'Has mustache text': 'No',
        'First bubble#41:2': message,
      });

      const currentTransform = recipientInstance.relativeTransform;
      recipientInstance.relativeTransform = [
        [-1, 0, currentTransform[0][2]], // Flip on y-axis
        [0, 1, currentTransform[1][2]], // Ignore x-axis
      ];

      recipientInstance.resize(402, recipientInstance.height);
      frame.appendChild(recipientInstance);
    }
    // console.log(role, message, messagesInGroup);
  });
}
