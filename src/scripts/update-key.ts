export default function updateAnthropicKey(apiKey: string): void {
  (async () => {
    await figma.clientStorage
      .setAsync('anthropicKey', apiKey)
      .catch(() => {
        figma.ui.postMessage({
          type: 'UPDATE_ANTHROPIC_KEY',
          keyDidUpdate: false,
        });
        figma.notify('Your API key could not be saved. Please try again.');
      })
      .finally(() => {
        figma.ui.postMessage({
          type: 'UPDATE_ANTHROPIC_KEY',
          keyDidUpdate: true,
          key: apiKey,
        });
        figma.notify('Your API key was saved.');
      });
  })();
}
