import getAnthropicKey from '../scripts/get-key';
import loadFonts from '../scripts/load-fonts';
import updateAnthropicKey from '../scripts/update-key';
import notifyUser from '../scripts/api-error';
import buildChatUserInterface from '../scripts/build-chat-ui';

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'UPDATE_ANTHROPIC_KEY':
      updateAnthropicKey(msg.apiKey);
      break;

    case 'BUILD_CHAT_UI':
      // console.log(msg.data);
      buildChatUserInterface({ data: msg.data, theme: msg.style, name: msg.prompt });
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
  await loadFonts();
})();

figma.showUI(__html__, { themeColors: true, width: 295, height: 375 });
