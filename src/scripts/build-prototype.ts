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
    console.log('No Persona component set found for group chat');
    return;
  }

  // Get unique recipients with their genders - same logic as chat bubbles
  const recipients = items
    .filter(item => item.role === 'recipient')
    .reduce((unique, item) => {
      if (!unique.some(u => u.name === item.name)) {
        unique.push({ name: item.name, gender: item.gender });
      }
      return unique;
    }, [] as Array<{ name: string; gender: string }>);

  // Sort recipients by name for consistent ordering - same as chat bubbles
  recipients.sort((a, b) => a.name.localeCompare(b.name));

  console.log('🔍 DEBUGGING AI-GENERATED DATA:');
  console.log('Raw chat items:', items.map(item => ({ name: item.name, gender: item.gender, role: item.role })));
  console.log('Filtered recipients:', recipients.map(r => `${r.name} (${r.gender})`));
  console.log('Recipients count:', recipients.length);
  
  // Look for Profile Photo components in the nav bar, just like chat bubbles
  const navBar = tempThreadComponent.findOne((node) => node.name === THREAD_PROPERTIES.NAV_BAR);
  if (!navBar) {
    console.log('No navigation bar found in thread component');
    return;
  }

  // Find all Profile Photo components within the nav bar
  // Note: This runs AFTER the photo type has been switched, so Group (4) should have 4 slots
  console.log(`🔍 Searching for profile photos in navigation bar (should have ${recipients.length} slots after photo type switch)...`);
  
  const profilePhotos = navBar && 'findAll' in navBar 
    ? navBar.findAll((node) => 
        node.name === 'Profile Photo' || node.name.toLowerCase().includes('profile')
      )
    : [];
  console.log(`📸 Found ${profilePhotos.length} profile photo instances for ${recipients.length} recipients:`, profilePhotos.map(p => p.name));

  // Check if we have enough profile photos for all recipients
  if (profilePhotos.length < recipients.length) {
    console.warn(`Only found ${profilePhotos.length} profile photos but need ${recipients.length} for all recipients. Some photos may not be updated.`);
  }

  // Update all profile photos found - cycle through recipients if we have more slots than recipients
  console.log(`📍 Updating ${profilePhotos.length} profile photo slots for ${recipients.length} recipients`);
  
  // Map each profile photo slot to a recipient (cycling through recipients if needed)
  for (let i = 0; i < profilePhotos.length; i++) {
    const recipientIndex = i % recipients.length; // Cycle through recipients if we have more slots
    const recipient = recipients[recipientIndex];
    const profilePhoto = profilePhotos[i];
    
    console.log(`Mapping profile photo slot ${i + 1} to recipient ${recipientIndex + 1}/${recipients.length}: ${recipient.name} (${recipient.gender})`);
    
    // Find the nested Persona component within the Profile Photo (same as chat bubbles)
    const persona = 'findOne' in profilePhoto 
      ? profilePhoto.findOne((node) => 
          node.name === 'Persona' && node.type === 'INSTANCE'
        )
      : null;

    if (persona && 'setProperties' in persona) {
      const recipientGender = recipient.gender.charAt(0).toUpperCase() + recipient.gender.slice(1);
      const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];
      const matchingVariants = personaVariants.filter((variant) => variant.name.includes(recipientGender));

      if (matchingVariants.length > 0) {
        // Use the same consistent mapping logic as chat bubbles
        const sameGenderRecipients = recipients.filter(r => r.gender === recipient.gender);
        const recipientIndex = sameGenderRecipients.findIndex(r => r.name === recipient.name);
        const variantIndex = recipientIndex % matchingVariants.length;
        const selectedVariant = matchingVariants[variantIndex];
        
        const personaInstance = persona as InstanceNode;
        console.log(`✅ Setting header persona to ${recipientGender} variant: ${selectedVariant.name} for ${recipient.name} (matching chat bubble)`);
        
        // Direct assignment - same as working chat bubble code
        personaInstance.mainComponent = selectedVariant;
        console.log('Header persona main component updated successfully');
      } else {
        console.log(`No matching variants found for ${recipientGender}`);
      }
    } else {
      console.log('No nested Persona instance found within Profile Photo');
      if ('children' in profilePhoto) {
        console.log('Profile Photo children:', profilePhoto.children.map(child => ({ name: child.name, type: child.type })));
      } else {
        console.log('Profile Photo has no children property');
      }
    }
  }
  
  // Log info about extra profile photos but don't hide them - they might be needed for the layout
  if (profilePhotos.length > recipients.length) {
    console.log(`ℹ️  Found ${profilePhotos.length - recipients.length} extra profile photo slots - this might be normal for the Group layout`);
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
      console.log(
        'Navigation Bar available properties:',
        availableProps ? Object.keys(availableProps) : 'No properties found'
      );

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
        
        console.log(`🔧 Setting navigation bar photo type for ${recipientCount} recipients (${recipientCount + 1}-person chat)`);
        console.log(`📸 Need to switch nested photo component to: "${photoType}"`);
        console.log('🤖 Check if this matches the participant data logged above');
        
        // Find the nested photo component within the navigation bar
        const photoComponent = navBar && 'findOne' in navBar 
          ? navBar.findOne((node) => 
              (node.name.toLowerCase().includes('photo') || node.name.toLowerCase().includes('avatar')) &&
              node.type === 'INSTANCE'
            )
          : null;
          
        if (photoComponent && 'setProperties' in photoComponent) {
          console.log(`🔍 Found nested photo component: ${photoComponent.name}`);
          
          // Find the component set that contains the Group (3) and Group (4) variants
          const rootNodes = figma.root.findAll();
          console.log('🔍 Searching for correct photo component set...');
          
          // Show all component sets to help identify the correct one
          const allComponentSets = rootNodes.filter(node => node.type === 'COMPONENT_SET');
          console.log('All component sets found:');
          allComponentSets.forEach(cs => {
            const variants = (cs as ComponentSetNode).children.map((child: any) => child.name);
            console.log(`  - ${cs.name}: [${variants.join(', ')}]`);
          });
          
          // Look specifically for "Navigation Bar Photo" component set
          const photoComponentSet = allComponentSets.find((cs) => 
            cs.name === 'Navigation Bar Photo'
          ) as ComponentSetNode | undefined;
          
          if (photoComponentSet) {
            console.log(`📸 Found photo component set: ${photoComponentSet.name}`);
            const variants = photoComponentSet.children as ComponentNode[];
            console.log('Available photo variants:', variants.map(v => v.name));
            
            // Find the correct variant (Group (3) or Group (4))
            const targetVariant = variants.find(variant => variant.name.includes(photoType));
            
            if (targetVariant) {
              console.log(`✅ Found target variant: ${targetVariant.name}`);
              (photoComponent as InstanceNode).mainComponent = targetVariant;
              console.log(`✅ Photo component switched to "${photoType}"`);
            } else {
              console.log(`❌ Could not find variant for "${photoType}"`);
              console.log('Available variants:', variants.map(v => v.name));
            }
          } else {
            console.log('❌ Could not find photo component set');
            console.log('Available component sets:', rootNodes
              .filter(node => node.type === 'COMPONENT_SET')
              .map(node => node.name)
            );
          }
        } else {
          console.log('❌ No nested photo component found in navigation bar');
          if (navBar && 'children' in navBar) {
            console.log('Navigation bar children:', navBar.children.map(child => ({ name: child.name, type: child.type })));
          }
        }
      }
    } catch (error) {
      console.log('Error accessing Navigation Bar main component:', error);
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
