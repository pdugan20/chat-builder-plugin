import { MESSAGE_TYPE } from '../constants/messages';

export default async function loadCollections() {
  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const hasLibrary = collections.some((collection) => collection.libraryName === 'iMessage Chat Builder');

    figma.ui.postMessage({
      type: MESSAGE_TYPE.HAS_COMPONENT_LIBRARY,
      hasLibrary,
    });

    if (hasLibrary) {
      const variables = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collections[0].key);
      const variable = await figma.variables.importVariableByKeyAsync(variables[2].key);
      await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
    }
  } catch (error) {
    figma.ui.postMessage({
      type: MESSAGE_TYPE.HAS_COMPONENT_LIBRARY,
      hasLibrary: false,
    });
  }
}
