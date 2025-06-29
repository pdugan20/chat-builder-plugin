import { MESSAGE_TYPE } from '../constants/messages';
import MODE_ID from '../constants/collections';

export async function checkIfHasLibrary() {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const hasLibrary = collections.some((collection) => collection.name === 'iMessage Chat Builder');

    figma.ui.postMessage({
      type: MESSAGE_TYPE.HAS_COMPONENT_LIBRARY,
      hasLibrary,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: MESSAGE_TYPE.HAS_COMPONENT_LIBRARY,
      hasLibrary: false,
    });
  }
}

export async function checkIfHasLocalComponents() {
  try {
    const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const localColorCollection = localCollections.find((c) => c.name === 'Color');

    if (!localColorCollection) {
      figma.ui.postMessage({
        type: MESSAGE_TYPE.HAS_LOCAL_COMPONENTS,
        hasLocalComponents: false,
      });
      return;
    }

    // Check if the collection has the expected mode IDs that our plugin uses
    const hasLightMode = localColorCollection.modes.some((mode) => mode.modeId === MODE_ID.light);
    const hasDarkMode = localColorCollection.modes.some((mode) => mode.modeId === MODE_ID.dark);

    const hasLocalComponents = hasLightMode && hasDarkMode;

    // If we have local components, preload all pages in the background
    if (hasLocalComponents) {
      figma.loadAllPagesAsync().catch(() => {
        // Ignore
      });
    }

    figma.ui.postMessage({
      type: MESSAGE_TYPE.HAS_LOCAL_COMPONENTS,
      hasLocalComponents,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: MESSAGE_TYPE.HAS_LOCAL_COMPONENTS,
      hasLocalComponents: false,
    });
  }
}
