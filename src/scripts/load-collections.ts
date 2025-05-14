export default async function loadCollections() {
  const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const variables = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collections[0].key);
  const variable = await figma.variables.importVariableByKeyAsync(variables[2].key);
  await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
}
