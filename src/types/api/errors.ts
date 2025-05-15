export interface AnthropicError {
  error: {
    error: {
      type: string;
      message: string;
    };
  };
}
