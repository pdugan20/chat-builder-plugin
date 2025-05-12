import chatData from '../constants/test-data';
import componentKey from '../constants/keys';

interface BuildChatUserInterfaceProps {
  data: string;
  width?: number;
}

// 'First bubble#80:3': 'Testing',
// 'Second bubble#80:4': 'Testing',
// 'Third bubble#80:7': 'Testing',

export default async function buildChatUserInterface({ data, width = 402 }: BuildChatUserInterfaceProps) {
  // eslint-disable-next-line no-console
  // console.log(data);

  const senderSet = await figma.importComponentSetByKeyAsync(componentKey.senderBubble);
  const recipientSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);
  console.log(senderSet.componentPropertyDefinitions);

  const frame = figma.createFrame();
  frame.layoutMode = 'VERTICAL';
  frame.resize(width, frame.height);

  // const recipientBubbleSet = await figma.importComponentSetByKeyAsync(componentKey.recipientBubble);
  // console.log(recipientBubbleSet);

  chatData.forEach((item, index) => {
    const { role, message, messagesInGroup } = item;

    if (role === 'sender') {
      const senderInstance = senderSet.defaultVariant.createInstance();

      const properties: Record<string, string> = {
        Bubbles: messagesInGroup === 3 ? '3' : messagesInGroup === 2 ? '2' : '1',
        Style: 'iOS',
        'Has reaction': 'No',
        'Has mustache text': 'No',
        'First bubble#80:3': message,
      };

      // If messagesInGroup is 2 or 3, set the 'Second bubble' property
      if (messagesInGroup >= 2 && chatData[index + 1]) {
        properties['Second bubble#80:4'] = chatData[index + 1].message;
      }

      // If messagesInGroup is 3, set the 'Third bubble' property
      if (messagesInGroup === 3 && chatData[index + 2]) {
        properties['Third bubble#80:7'] = chatData[index + 2].message;
      }

      senderInstance.setProperties(properties);

      senderInstance.resize(width, senderInstance.height);
      frame.appendChild(senderInstance);
    }

    if (role === 'recipient') {
      const recipientInstance = recipientSet.defaultVariant.createInstance();

      const properties: Record<string, string> = {
        Bubbles: messagesInGroup === 3 ? '3' : messagesInGroup === 2 ? '2' : '1',
        'Is group chat': 'No',
        'Has reaction': 'No',
        'Has mustache text': 'No',
        'First bubble#41:2': message,
      };

      // If messagesInGroup is 2 or 3, set the 'Second bubble' property
      if (messagesInGroup >= 2 && chatData[index + 1]) {
        properties['Second bubble#40:1'] = chatData[index + 1].message;
      }

      // If messagesInGroup is 3, set the 'Third bubble' property
      if (messagesInGroup === 3 && chatData[index + 2]) {
        properties['Third bubble#45:0'] = chatData[index + 2].message;
      }

      recipientInstance.setProperties(properties);

      recipientInstance.relativeTransform = [
        [-1, 0, recipientInstance.relativeTransform[0][2]], // Flip horizontally
        [0, 1, recipientInstance.relativeTransform[1][2]], // Keep vertical scale unchanged
      ];

      recipientInstance.resize(width, recipientInstance.height);
      frame.appendChild(recipientInstance);
    }

    console.log(role, message, messagesInGroup);
  });
}
