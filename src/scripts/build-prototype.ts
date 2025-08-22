import { THREAD_PROPERTIES, COMPONENT_NAMES, PHOTO_PROPERTIES, CHAT_ROLES } from '../constants/components';
import { FRAME_PADDING } from '../constants/dimensions';
import { ChatItem } from '../types/chat';
import { getRecipientName, getRecipientsList, getUniqueRecipients } from '../utils/chat';
import { setFrameThemeAndBackground } from '../utils/frame';
import { findComponentSet, safeSetProperties } from '../services/component';
import getPersonaForRecipient from '../utils/persona';
import { NODE_MATCHERS } from '../utils/node-finder';

function createPrototypeFrame(tempThreadComponent: ComponentNode, frameComponent: ComponentNode): FrameNode {
  const prototypeFrame = figma.createFrame();
  prototypeFrame.name = COMPONENT_NAMES.PROTOTYPE;
  prototypeFrame.resize(tempThreadComponent.width, tempThreadComponent.height);
  prototypeFrame.x = frameComponent.x + frameComponent.width + 50;
  prototypeFrame.y = frameComponent.y;
  prototypeFrame.cornerRadius = 40;

  return prototypeFrame;
}

async function setPersonaProperties(tempThreadComponent: ComponentNode, items: ChatItem[]): Promise<void> {
  const persona = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.PERSONA);
  const personaSet = findComponentSet(COMPONENT_NAMES.PERSONA);

  if (personaSet && persona && 'setProperties' in persona) {
    // Get the first recipient's info
    const recipients = getRecipientsList(items);
    if (recipients.length > 0) {
      const firstRecipient = recipients[0];
      const personaVariants = personaSet.children as ComponentNode[];
      const selectedVariant = getPersonaForRecipient(firstRecipient.name, firstRecipient.gender, personaVariants);

      if (selectedVariant) {
        (persona as InstanceNode).mainComponent = selectedVariant;
      }
    }
  }
}

async function setGroupPersonaProperties(tempThreadComponent: ComponentNode, items: ChatItem[]): Promise<void> {
  const personaSet = findComponentSet(COMPONENT_NAMES.PERSONA);

  if (!personaSet) {
    return;
  }

  // Get unique recipients with their genders
  const recipients = getRecipientsList(items);

  const navBar = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.NAV_BAR);
  if (!navBar) {
    return;
  }

  // Find all Profile Photo components within the nav bar
  const profilePhotos =
    navBar && 'findAll' in navBar ? navBar.findAll(NODE_MATCHERS.profilePhoto(COMPONENT_NAMES.PROFILE_PHOTO)) : [];

  // Map each profile photo slot to a recipient (cycling through recipients if needed)
  for (let i = 0; i < profilePhotos.length; i += 1) {
    const recipientIndex = i % recipients.length;
    const recipient = recipients[recipientIndex];
    const profilePhoto = profilePhotos[i];

    const persona =
      'findOne' in profilePhoto
        ? profilePhoto.findOne((node) => node.name === COMPONENT_NAMES.PERSONA && node.type === 'INSTANCE')
        : null;

    if (persona && 'setProperties' in persona) {
      const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];

      // Use the same hash-based selection as chat bubbles
      const selectedVariant = getPersonaForRecipient(recipient.name, recipient.gender, personaVariants);

      if (selectedVariant) {
        const personaInstance = persona as InstanceNode;
        personaInstance.mainComponent = selectedVariant;
      }
    }
  }

  if (profilePhotos.length > recipients.length) {
    // Extra photos exist but we keep them for layout purposes
  }
}

async function createThreadComponent(
  threadVariant: ComponentNode,
  recipientName: string,
  items: ChatItem[],
  isGroupChat: boolean
): Promise<ComponentNode> {
  const tempThreadComponent = figma.createComponent();
  tempThreadComponent.name = COMPONENT_NAMES.THREAD;
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
    const navBarInstance = navBar as InstanceNode;

    // Use async API to get properties
    try {
      // Get main component for property setting
      await navBarInstance.getMainComponentAsync();

      // Set chat name
      let chatName = recipientName;
      if (isGroupChat) {
        const recipientCount = getUniqueRecipients(items).size;
        chatName = `${recipientCount} people`;
      }

      try {
        await safeSetProperties(navBarInstance, { [THREAD_PROPERTIES.CHAT_NAME]: chatName });
      } catch (error) {
        // Error already logged in safeSetProperties
      }

      // Set photo type for group chats
      if (isGroupChat) {
        const recipientCount = getUniqueRecipients(items).size;
        // Determine photo type based on recipient count
        // 2 recipients = 3-person chat (use Group (3))
        // 3+ recipients = 4-person chat (use Group (4))
        const photoType = recipientCount === 2 ? PHOTO_PROPERTIES.TWO_PHOTOS : PHOTO_PROPERTIES.THREE_PHOTOS;

        // Find the nested photo component within the navigation bar
        const photoComponent =
          navBar && 'findOne' in navBar
            ? navBar.findOne((node) => NODE_MATCHERS.navigationPhoto()(node) && node.type === 'INSTANCE')
            : null;

        if (photoComponent && 'setProperties' in photoComponent) {
          // Look specifically for "Navigation Bar Photo" component set
          const photoComponentSet = findComponentSet(COMPONENT_NAMES.NAVIGATION_BAR_PHOTO);

          if (photoComponentSet) {
            const variants = photoComponentSet.children as ComponentNode[];

            // Find the correct variant (Group (3) or Group (4))
            const targetVariant = variants.find((variant) => variant.name.includes(photoType));

            if (targetVariant) {
              (photoComponent as InstanceNode).mainComponent = targetVariant;
            }
          }
        }
      }
    } catch (error) {
      // Error setting group photo
    }
  }

  if (!isGroupChat) {
    await setPersonaProperties(tempThreadComponent, items);
  } else {
    await setGroupPersonaProperties(tempThreadComponent, items);
  }

  return tempThreadComponent;
}

async function buildPrototype(
  frameComponent: ComponentNode,
  threadVariant: ComponentNode,
  items: ChatItem[],
  theme: 'light' | 'dark',
  isGroupChat: boolean = false
): Promise<void> {
  const recipientName = getRecipientName(items);
  const tempThreadComponent = await createThreadComponent(threadVariant, recipientName, items, isGroupChat);

  // Find the placeholder in the component first
  const placeholder = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.PLACEHOLDER);

  if (placeholder) {
    // Create instance of the component to insert
    const frameInstance = frameComponent.createInstance();
    frameInstance.paddingTop = FRAME_PADDING.top;

    // Check if last message is from recipient for extra bottom padding
    let bottomPadding = FRAME_PADDING.bottom;
    if (items && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (lastItem.role === CHAT_ROLES.RECIPIENT) {
        bottomPadding += 5;
      }
    }
    frameInstance.paddingBottom = bottomPadding;

    // Set the frame instance position before inserting
    frameInstance.x = placeholder.x;
    frameInstance.y = 0;

    // Insert the frame instance at the placeholder's index
    const placeholderIndex = placeholder.parent?.children.indexOf(placeholder) ?? 0;
    placeholder.parent?.insertChild(placeholderIndex, frameInstance);

    // Remove the placeholder
    placeholder.remove();
  }

  // Now create and position the prototype frame with everything already in place
  const prototypeFrame = createPrototypeFrame(tempThreadComponent, frameComponent);
  await setFrameThemeAndBackground(prototypeFrame, theme);
  const threadInstance = tempThreadComponent.createInstance();
  prototypeFrame.appendChild(threadInstance);

  // Clean up temporary components first
  tempThreadComponent.remove();

  // Add a small delay to ensure all layout operations are complete
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 50);
  });

  // Focus viewport on the new components after everything is settled
  figma.viewport.scrollAndZoomIntoView([frameComponent, prototypeFrame]);
}

export default buildPrototype;
