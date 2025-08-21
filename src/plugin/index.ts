import getAnthropicKey from '../scripts/get-key';
import loadFonts from '../scripts/load-fonts';
import { checkIfHasLibrary, checkIfHasLocalComponents } from '../scripts/check-components';
import updateAnthropicKey from '../scripts/update-key';
import notifyUser from '../scripts/api-error';
import buildChatUserInterface from '../scripts/build-chat-ui';
import cleanAndParseJson from '../utils/json';
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

async function initializeUI() {
  figma.showUI(__html__, { themeColors: true, width: PLUGIN_WIDTH, height: PLUGIN_HEIGHT });
  await initializePlugin();
}

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case MESSAGE_TYPE.UPDATE_ANTHROPIC_KEY:
      updateAnthropicKey(msg.apiKey);
      break;

    case MESSAGE_TYPE.BUILD_CHAT_UI:
      buildChatUserInterface({
        data: msg.data,
        theme: msg.style,
        name: msg.prompt,
        includePrototype: msg.includePrototype,
      });
      break;

    case MESSAGE_TYPE.PARSE_AND_BUILD_CHAT:
      // Parse JSON and build UI with async handling
      (async () => {
        try {
          const parsedData = cleanAndParseJson(msg.rawResponse);
          if (!parsedData) {
            notifyUser({
              errorMessage: 'Failed to parse API response',
              retryable: true,
            });
            figma.ui.postMessage({ type: MESSAGE_TYPE.BUILD_COMPLETE });
            return;
          }

          // Build the UI - this is now async with yielding
          await buildChatUserInterface({
            data: parsedData,
            theme: msg.style,
            name: msg.prompt,
            includePrototype: msg.includePrototype,
          });
        } catch (error) {
          notifyUser({
            errorMessage: error instanceof Error ? error.message : 'Failed to parse API response',
            retryable: true,
          });
          figma.ui.postMessage({ type: MESSAGE_TYPE.BUILD_COMPLETE });
        }
      })();
      break;

    case MESSAGE_TYPE.POST_API_ERROR:
      notifyUser({
        errorMessage: msg.error,
        retryable: msg.retryable ?? false,
      });
      break;

    case MESSAGE_TYPE.RELOAD:
      initializeUI();
      break;

    default:
      break;
  }
};

(async () => {
  await initializeUI();
})();
