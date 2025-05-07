export default async function getAnthropicKey() {
  try {
    const anthropicKey = await figma.clientStorage.getAsync('anthropicKey');

    if (anthropicKey) {
      figma.ui.postMessage({
        type: 'HAS_ANTHROPIC_KEY',
        hasKey: true,
        key: anthropicKey,
      });
    } else {
      figma.ui.postMessage({
        type: 'HAS_ANTHROPIC_KEY',
        hasKey: false,
      });
    }
  } catch (err) {
    figma.notify('Error retrieving API key.');
  }
}
