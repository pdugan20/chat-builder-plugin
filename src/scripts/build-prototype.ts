import { THREAD_PROPERTIES } from '../constants/components';
import { FRAME_PADDING } from '../constants/dimensions';
import { ChatItem } from '../types/chat';
import { getRecipientName, getRecipientGender } from '../utils/chat';
import { setFrameThemeAndBackground } from '../utils/frame';

function createPrototypeFrame(tempThreadComponent: ComponentNode, frameComponent: ComponentNode): FrameNode {
  const prototypeFrame = figma.createFrame();
  prototypeFrame.name = 'Prototype';
  prototypeFrame.resize(tempThreadComponent.width, tempThreadComponent.height);
  prototypeFrame.x = frameComponent.x + frameComponent.width + 50;
  prototypeFrame.y = frameComponent.y;
  prototypeFrame.cornerRadius = 40;

  return prototypeFrame;
}

function setPersonaProperties(tempThreadComponent: ComponentNode, items: ChatItem[]): void {
  const persona = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.PERSONA);
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
  const navBar = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.NAV_BAR);
  if (navBar && 'setProperties' in navBar) {
    (navBar as InstanceNode).setProperties({ [THREAD_PROPERTIES.CHAT_NAME]: recipientName });
  }

  // Set persona properties
  setPersonaProperties(tempThreadComponent, items);

  return tempThreadComponent;
}

async function buildPrototype(
  frameComponent: ComponentNode,
  threadVariant: ComponentNode,
  items: ChatItem[],
  theme: 'light' | 'dark'
): Promise<void> {
  const recipientName = getRecipientName(items);
  const tempThreadComponent = createThreadComponent(threadVariant, recipientName, items);

  // Create and position the prototype frame
  const prototypeFrame = createPrototypeFrame(tempThreadComponent, frameComponent);
  await setFrameThemeAndBackground(prototypeFrame, theme);
  const threadInstance = tempThreadComponent.createInstance();
  prototypeFrame.appendChild(threadInstance);

  // Make prototype frame invisible
  prototypeFrame.visible = false;

  // Find the placeholder in the component
  const placeholder = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.PLACEHOLDER);
  if (placeholder) {
    // Create instance of the component
    const frameInstance = frameComponent.createInstance();
    frameInstance.paddingTop = FRAME_PADDING.top;
    frameInstance.paddingBottom = FRAME_PADDING.bottom;

    // Set the frame instance position before inserting
    frameInstance.x = placeholder.x;
    frameInstance.y = 0;

    // Insert the frame instance at the placeholder's index
    const placeholderIndex = placeholder.parent?.children.indexOf(placeholder) ?? 0;
    placeholder.parent?.insertChild(placeholderIndex, frameInstance);

    // Remove the placeholder
    placeholder.remove();
  }

  // Make prototype frame visible again
  prototypeFrame.visible = true;

  // Focus viewport on the new components
  figma.viewport.scrollAndZoomIntoView([frameComponent, prototypeFrame]);

  // Clean up temporary components
  tempThreadComponent.remove();
}

export default buildPrototype;
