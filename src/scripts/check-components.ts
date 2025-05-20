import { MESSAGE_TYPE } from '../constants/messages';

export async function checkIfHasLibrary() {
  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const hasLibrary = collections.some((collection) => collection.libraryName === 'iMessage Chat Builder');

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
    const allNodes = figma.root.findAll();
    const components = allNodes.filter((node) => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET');

    const hasLocalComponents = components.some((c) => c.name.includes('iMessage'));

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
