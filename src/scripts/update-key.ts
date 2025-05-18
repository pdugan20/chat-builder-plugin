import { UpdateKeyMessage } from '../types/plugin/messages';
import { MESSAGE_TYPE } from '../constants/messages';

export default async function updateAnthropicKey(key: string): Promise<void> {
  try {
    await figma.clientStorage.setAsync('anthropicKey', key);
    const message: UpdateKeyMessage = {
      type: MESSAGE_TYPE.UPDATE_ANTHROPIC_KEY,
      keyDidUpdate: true,
      key,
    };

    figma.ui.postMessage(message);
    figma.notify('Your API key was saved.');
  } catch (error) {
    const message: UpdateKeyMessage = {
      type: MESSAGE_TYPE.UPDATE_ANTHROPIC_KEY,
      keyDidUpdate: false,
    };

    figma.ui.postMessage(message);
    figma.notify('Your API key could not be saved. Please try again.', { error: true, timeout: 5000 });
  }
}
