import getAnthropicKey from '../scripts/get-key';
import loadFonts from '../scripts/load-fonts';
import { checkIfHasLibrary, checkIfHasLocalComponents } from '../scripts/check-components';
import updateAnthropicKey from '../scripts/update-key';
import notifyUser from '../scripts/api-error';
import buildChatUserInterface from '../scripts/build-chat-ui';
import { MESSAGE_TYPE } from '../constants/messages';
import { PLUGIN_WIDTH, PLUGIN_HEIGHT } from '../constants/dimensions';

async function initializePlugin() {
  // Give the UI a moment to initialize
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });

  await getAnthropicKey();
  await loadFonts();
  await checkIfHasLibrary();
  await checkIfHasLocalComponents();
}

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case MESSAGE_TYPE.UPDATE_ANTHROPIC_KEY:
      updateAnthropicKey(msg.apiKey);
      break;

    case MESSAGE_TYPE.BUILD_CHAT_UI:
      buildChatUserInterface({ data: msg.data, theme: msg.style, name: msg.prompt });
      break;

    case MESSAGE_TYPE.POST_API_ERROR:
      notifyUser(msg.errorType);
      break;

    case MESSAGE_TYPE.RESIZE:
      figma.ui.resize(PLUGIN_WIDTH, msg.height);
      break;

    case MESSAGE_TYPE.RELOAD:
      figma.showUI(__html__, { themeColors: true, width: PLUGIN_WIDTH, height: PLUGIN_HEIGHT.DEFAULT });
      initializePlugin();
      break;

    default:
      break;
  }
};

(async () => {
  figma.showUI(__html__, { themeColors: true, width: PLUGIN_WIDTH, height: PLUGIN_HEIGHT.DEFAULT });
  await initializePlugin();
})();
