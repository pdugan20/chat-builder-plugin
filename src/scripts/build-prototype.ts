import { THREAD_PROPERTIES } from '../constants/components';
import { FRAME_PADDING } from '../constants/dimensions';
import { ChatItem } from '../types/chat';
import { getRecipientName, getRecipientGender } from '../utils/chat';
import { setFrameThemeAndBackground } from '../utils/frame';
import { getPersonaForRecipient } from './build-chat-ui';

function createPrototypeFrame(tempThreadComponent: ComponentNode, frameComponent: ComponentNode): FrameNode {
  const prototypeFrame = figma.createFrame();
  prototypeFrame.name = 'Prototype';
  prototypeFrame.resize(tempThreadComponent.width, tempThreadComponent.height);
  prototypeFrame.x = frameComponent.x + frameComponent.width + 50;
  prototypeFrame.y = frameComponent.y;
  prototypeFrame.cornerRadius = 40;

  return prototypeFrame;
}

async function setPersonaProperties(tempThreadComponent: ComponentNode, items: ChatItem[]): Promise<void> {
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

async function setGroupPersonaProperties(tempThreadComponent: ComponentNode, items: ChatItem[]): Promise<void> {
  const rootNodes = figma.root.findAll();
  const personaSet = rootNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Persona');

  if (!personaSet) {
    return;
  }

  // Get unique recipients with their genders - same logic as chat bubbles
  const recipients = items
    .filter((item) => item.role === 'recipient')
    .reduce(
      (unique, item) => {
        if (!unique.some((u) => u.name === item.name)) {
          unique.push({ name: item.name, gender: item.gender });
        }
        return unique;
      },
      [] as Array<{ name: string; gender: string }>
    );

  // Sort recipients by name for consistent ordering - same as chat bubbles
  recipients.sort((a, b) => a.name.localeCompare(b.name));

  // Look for Profile Photo components in the nav bar, just like chat bubbles
  const navBar = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.NAV_BAR);
  if (!navBar) {
    return;
  }

  // Find all Profile Photo components within the nav bar
  // Note: This runs AFTER the photo type has been switched, so Group (4) should have 4 slots

  const profilePhotos =
    navBar && 'findAll' in navBar
      ? navBar.findAll((node) => node.name === 'Profile Photo' || node.name.toLowerCase().includes('profile'))
      : [];

  // Check if we have enough profile photos for all recipients
  // Silently handle if there are fewer photos than recipients

  // Update all profile photos found - cycle through recipients if we have more slots than recipients

  // Map each profile photo slot to a recipient (cycling through recipients if needed)
  for (let i = 0; i < profilePhotos.length; i++) {
    const recipientIndex = i % recipients.length; // Cycle through recipients if we have more slots
    const recipient = recipients[recipientIndex];
    const profilePhoto = profilePhotos[i];

    // Find the nested Persona component within the Profile Photo (same as chat bubbles)
    const persona =
      'findOne' in profilePhoto
        ? profilePhoto.findOne((node) => node.name === 'Persona' && node.type === 'INSTANCE')
        : null;

    if (persona && 'setProperties' in persona) {
      const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];

      // Use the same hash-based selection as chat bubbles
      const selectedVariant = getPersonaForRecipient(recipient.name, recipient.gender, personaVariants);

      if (selectedVariant) {
        const personaInstance = persona as InstanceNode;
        personaInstance.mainComponent = selectedVariant;
      }
    } else {
      if ('children' in profilePhoto) {
      } else {
      }
    }
  }

  // Log info about extra profile photos but don't hide them - they might be needed for the layout
  if (profilePhotos.length > recipients.length) {
  }
}

async function createThreadComponent(
  threadVariant: ComponentNode,
  recipientName: string,
  items: ChatItem[],
  isGroupChat: boolean
): Promise<ComponentNode> {
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
    const navBarInstance = navBar as InstanceNode;

    // Use async API to get properties
    try {
      const mainComponent = await navBarInstance.getMainComponentAsync();
      const availableProps = mainComponent?.componentPropertyDefinitions;

      // Set chat name
      let chatName = recipientName;
      if (isGroupChat) {
        const uniqueRecipients = new Set(items.filter((item) => item.role === 'recipient').map((item) => item.name));
        const recipientCount = uniqueRecipients.size; // Only count recipients, not sender
        chatName = `${recipientCount} people`;
      }

      navBarInstance.setProperties({ [THREAD_PROPERTIES.CHAT_NAME]: chatName });

      // Set photo type for group chats - MUST be done before updating personas
      if (isGroupChat) {
        const uniqueRecipients = new Set(items.filter((item) => item.role === 'recipient').map((item) => item.name));
        const recipientCount = uniqueRecipients.size; // Only count recipients
        const photoType = recipientCount === 2 ? 'Group (3)' : 'Group (4)'; // 2 recipients = 3-person chat, 3 recipients = 4-person chat

        // Find the nested photo component within the navigation bar
        const photoComponent =
          navBar && 'findOne' in navBar
            ? navBar.findOne(
                (node) =>
                  (node.name.toLowerCase().includes('photo') || node.name.toLowerCase().includes('avatar')) &&
                  node.type === 'INSTANCE'
              )
            : null;

        if (photoComponent && 'setProperties' in photoComponent) {
          // Find the component set that contains the Group (3) and Group (4) variants
          const rootNodes = figma.root.findAll();

          // Show all component sets to help identify the correct one
          const allComponentSets = rootNodes.filter((node) => node.type === 'COMPONENT_SET');
          allComponentSets.forEach((cs) => {
            const variants = (cs as ComponentSetNode).children.map((child: any) => child.name);
          });

          // Look specifically for "Navigation Bar Photo" component set
          const photoComponentSet = allComponentSets.find((cs) => cs.name === 'Navigation Bar Photo') as
            | ComponentSetNode
            | undefined;

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
      // Error setting group photo - continue execution
    }
  }

  // Set persona properties for 1:1 chats, handle differently for group chats
  if (!isGroupChat) {
    await setPersonaProperties(tempThreadComponent, items);
  } else {
    // For group chats, set personas for each participant
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
    // Recipients never have mustache text, so we add padding when last message is from recipient
    let bottomPadding = FRAME_PADDING.bottom;
    if (items && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (lastItem.role === 'recipient') {
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
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Focus viewport on the new components after everything is settled
  figma.viewport.scrollAndZoomIntoView([frameComponent, prototypeFrame]);
}

export default buildPrototype;
