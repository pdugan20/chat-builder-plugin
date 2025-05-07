import getAnthropicKey from '../scripts/get-key';
import updateAnthropicKey from '../scripts/update-key';

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
  await getAnthropicKey();
})();

figma.showUI(__html__, { themeColors: true, width: 295, height: 375 });
