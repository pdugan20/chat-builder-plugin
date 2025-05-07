export default async function getAnthropicKey() {
  try {
    const anthropicKey = await figma.clientStorage.getAsync('anthropicKey');

    if (anthropicKey) {
      figma.ui.postMessage({
        type: 'hasAnthropicKey',
        hasKey: true,
        key: anthropicKey,
      });
    } else {
      figma.ui.postMessage({
        type: 'hasAnthropicKey',
        hasKey: false,
      });
    }
  } catch (err) {
    figma.notify('Error retrieving API key.');
  }
}
