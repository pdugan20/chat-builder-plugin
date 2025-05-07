import updateAnthropicKey from '../scripts/update-key';

let anthropicKey: string;

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'updateAnthropicKey':
      updateAnthropicKey(msg.apiKey);
      break;

    default:
      break;
  }
};

(async () => {
  try {
    anthropicKey = await figma.clientStorage.getAsync('anthropicKey');

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
})();

figma.showUI(__html__, { themeColors: true, width: 295, height: 375 });
