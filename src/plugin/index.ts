import getAnthropicKey from '../scripts/get-key';
import updateAnthropicKey from '../scripts/update-key';
import notifyUser from '../scripts/api-error';
import buildChatUserInterface from '../scripts/build-chat-ui';

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'UPDATE_ANTHROPIC_KEY':
      updateAnthropicKey(msg.apiKey);
      break;

    case 'BUILD_CHAT_UI':
      buildChatUserInterface(msg.data);
      break;

    case 'POST_API_ERROR':
      notifyUser(msg.errorType);
      break;

    default:
      break;
  }
};

(async () => {
  await getAnthropicKey();
})();

figma.showUI(__html__, { themeColors: true, width: 295, height: 375 });
