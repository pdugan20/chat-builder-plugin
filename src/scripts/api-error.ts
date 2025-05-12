export default async function notifyUser(errorType: string) {
  let errorMessage = 'There was a problem generating your chat. Please try again later.';

  switch (errorType) {
    case 'authentication_error':
      errorMessage = 'Your Anthropic API key is invalid. Please update your key and try again.';
      break;
    case 'overloaded_error':
      errorMessage = 'The Anthropic API is currently overloaded. Please try again later.';
      break;
    case 'rate_limit_error':
      errorMessage = 'Your Anthropic account is currently being rate limited. Please try again later.';
      break;
    default:
      break;
  }

  figma.notify(errorMessage, {
    timeout: 5000,
    error: true,
  });
}
