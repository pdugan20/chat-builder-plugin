import { MESSAGE_TYPE } from '../constants/messages';

interface ErrorNotification {
  errorMessage: string;
  retryable?: boolean;
}

export default async function notifyUser({ errorMessage, retryable = false }: ErrorNotification) {
  const actionButton = retryable
    ? {
        text: 'Try Again',
        action: () => {
          parent.postMessage({ pluginMessage: { type: MESSAGE_TYPE.RETRY_GENERATION } }, '*');
        },
      }
    : undefined;

  figma.notify(errorMessage, {
    timeout: 10000,
    error: true,
    button: actionButton,
  });
}
