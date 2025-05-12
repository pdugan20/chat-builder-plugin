export default async function notifyUser(errorType: string) {
  let errorMessage = 'There was a problem generating your chat. Please try again.';

  switch (errorType) {
    case 'authentication_error':
      errorMessage = 'Your API key is invalid. Please check your key and try again.';
      break;
    default:
      break;
  }

  figma.notify(errorMessage, {
    timeout: 5000,
    error: true,
  });
}
