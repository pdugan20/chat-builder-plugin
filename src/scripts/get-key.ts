import { HasKeyMessage } from '../types/plugin/messages';
import { MESSAGE_TYPE } from '../constants/messages';

export default async function getAnthropicKey(): Promise<void> {
  try {
    const key = await figma.clientStorage.getAsync('anthropicKey');
    const message: HasKeyMessage = {
      type: MESSAGE_TYPE.HAS_ANTHROPIC_KEY,
      hasKey: Boolean(key),
      ...(key && { key }),
    };

    figma.ui.postMessage(message);
  } catch (error) {
    figma.notify('Error retrieving API key.', { error: true, timeout: 5000 });

    const message: HasKeyMessage = {
      type: MESSAGE_TYPE.HAS_ANTHROPIC_KEY,
      hasKey: false,
    };

    figma.ui.postMessage(message);
  }
}
