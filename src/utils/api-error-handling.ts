import { MESSAGE_TYPE } from '../constants/messages';

interface ErrorDetails {
  type: string;
  message: string;
  retryable: boolean;
}

interface AnthropicError {
  error?: {
    error?: {
      type: string;
      message?: string;
    };
  };
}

const handleAnthropicError = (error: AnthropicError): ErrorDetails => {
  let errorDetails: ErrorDetails = {
    type: 'unknown_error',
    message: 'An unexpected error occurred',
    retryable: true,
  };

  if (error.error?.error?.type) {
    switch (error.error.error.type) {
      case 'authentication_error':
        errorDetails = {
          type: 'authentication_error',
          message: 'Your API key is invalid or has expired',
          retryable: false,
        };
        break;
      case 'rate_limit_error':
        errorDetails = {
          type: 'rate_limit_error',
          message: 'Too many requests. Please wait a moment and try again',
          retryable: true,
        };
        break;
      case 'overloaded_error':
        errorDetails = {
          type: 'overloaded_error',
          message: 'The API is currently experiencing high load',
          retryable: true,
        };
        break;
      case 'invalid_request_error':
        errorDetails = {
          type: 'invalid_request_error',
          message: 'The request was invalid. Please check your inputs',
          retryable: false,
        };
        break;
      case 'not_found_error':
        errorDetails = {
          type: 'not_found_error',
          message: 'The requested resource was not found',
          retryable: false,
        };
        break;
      default:
        // Sanitize error message to remove technical details like model names
        const rawMessage = error.error.error.message || 'An error occurred';
        const sanitizedMessage = rawMessage.replace(/claude-[0-9]+-[a-z]+-[0-9-]+/gi, 'the AI model');
        errorDetails = {
          type: error.error.error.type,
          message: sanitizedMessage,
          retryable: true,
        };
    }
  }

  // Post error message to UI
  parent.postMessage(
    {
      pluginMessage: {
        type: MESSAGE_TYPE.POST_API_ERROR,
        errorType: errorDetails.type,
        errorMessage: errorDetails.message,
        retryable: errorDetails.retryable,
      },
    },
    '*'
  );

  return errorDetails;
};

export default handleAnthropicError;
