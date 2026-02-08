import { ChatItem } from '../types/chat';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface ChatDataValidationResult extends ValidationResult {
  data?: ChatItem[];
}

export default class ValidationService {
  private static readonly PROMPT_MIN_LENGTH = 20;
  private static readonly PROMPT_MAX_LENGTH = 150;

  validatePrompt(prompt: string): ValidationResult {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Please enter a prompt' };
    }

    const trimmedLength = prompt.trim().length;

    if (trimmedLength < ValidationService.PROMPT_MIN_LENGTH) {
      return {
        valid: false,
        error: `Prompt must be at least ${ValidationService.PROMPT_MIN_LENGTH} characters`,
      };
    }

    if (trimmedLength > ValidationService.PROMPT_MAX_LENGTH) {
      return {
        valid: false,
        error: `Prompt must be less than ${ValidationService.PROMPT_MAX_LENGTH} characters`,
      };
    }

    return { valid: true };
  }

  validateApiKey(apiKey: string | null): ValidationResult {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: 'API key is required' };
    }
    return { valid: true };
  }

  validateChatData(data: unknown): ChatDataValidationResult {
    if (!Array.isArray(data)) {
      return { valid: false, error: 'Chat data must be an array' };
    }

    if (data.length === 0) {
      return { valid: false, error: 'Chat data cannot be empty' };
    }

    // Validate each item has required fields
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];
      if (!item.role || !item.message || !item.name) {
        return {
          valid: false,
          error: `Chat item at index ${i} is missing required fields`,
        };
      }
    }

    return { valid: true, data: data as ChatItem[] };
  }

  validateJsonResponse(json: string): ChatDataValidationResult {
    try {
      const parsed = JSON.parse(json);
      return this.validateChatData(parsed);
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }
}
