import ValidationService from '../validation';
import { ChatItem } from '../../types/chat';
import createMockChatItem from '../../test/test-helpers';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validatePrompt', () => {
    it('should accept valid prompt', () => {
      const result = validationService.validatePrompt('This is a valid prompt with enough length');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty prompt', () => {
      const result = validationService.validatePrompt('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a prompt');
    });

    it('should reject whitespace-only prompt', () => {
      const result = validationService.validatePrompt('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a prompt');
    });

    it('should reject prompt that is too short', () => {
      const result = validationService.validatePrompt('Too short');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Prompt must be at least 20 characters');
    });

    it('should accept prompt at minimum length (20 chars)', () => {
      const result = validationService.validatePrompt('12345678901234567890'); // exactly 20
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject prompt that is too long', () => {
      const longPrompt = 'a'.repeat(151);
      const result = validationService.validatePrompt(longPrompt);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Prompt must be less than 150 characters');
    });

    it('should accept prompt at maximum length (150 chars)', () => {
      const maxPrompt = 'a'.repeat(150); // exactly 150
      const result = validationService.validatePrompt(maxPrompt);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should trim whitespace before checking length', () => {
      const result = validationService.validatePrompt('  This is exactly twenty  '); // 20 chars without spaces
      expect(result.valid).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should accept valid API key', () => {
      const result = validationService.validateApiKey('sk-ant-1234567890');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject null API key', () => {
      const result = validationService.validateApiKey(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is required');
    });

    it('should reject empty API key', () => {
      const result = validationService.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is required');
    });

    it('should reject whitespace-only API key', () => {
      const result = validationService.validateApiKey('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is required');
    });
  });

  describe('validateChatData', () => {
    const validChatItem: ChatItem = createMockChatItem({
      name: 'Alice',
      message: 'Hello',
    });

    it('should accept valid chat data array', () => {
      const result = validationService.validateChatData([validChatItem]);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([validChatItem]);
    });

    it('should accept multiple valid chat items', () => {
      const chatData = [validChatItem, createMockChatItem({ role: 'recipient', message: 'Hi there', name: 'Bob' })];
      const result = validationService.validateChatData(chatData);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(chatData);
    });

    it('should reject non-array data', () => {
      const result = validationService.validateChatData({ not: 'an array' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat data must be an array');
    });

    it('should reject empty array', () => {
      const result = validationService.validateChatData([]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat data cannot be empty');
    });

    it('should reject chat item missing role', () => {
      const result = validationService.validateChatData([{ message: 'Hello', name: 'Alice' }]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat item at index 0 is missing required fields');
    });

    it('should reject chat item missing message', () => {
      const result = validationService.validateChatData([{ role: 'user', name: 'Alice' }]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat item at index 0 is missing required fields');
    });

    it('should reject chat item missing name', () => {
      const result = validationService.validateChatData([{ role: 'user', message: 'Hello' }]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat item at index 0 is missing required fields');
    });

    it('should identify index of invalid item in array', () => {
      const chatData = [
        validChatItem,
        { role: 'user', message: 'Valid' }, // missing name
        validChatItem,
      ];
      const result = validationService.validateChatData(chatData);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat item at index 1 is missing required fields');
    });
  });

  describe('validateJsonResponse', () => {
    const validChatItem: ChatItem = createMockChatItem({
      name: 'Alice',
      message: 'Hello',
    });

    it('should accept valid JSON with valid chat data', () => {
      const json = JSON.stringify([validChatItem]);
      const result = validationService.validateJsonResponse(json);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual([validChatItem]);
    });

    it('should reject invalid JSON', () => {
      const result = validationService.validateJsonResponse('{ not valid json }');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject valid JSON with invalid chat data', () => {
      const json = JSON.stringify({ not: 'an array' });
      const result = validationService.validateJsonResponse(json);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat data must be an array');
    });

    it('should reject valid JSON with empty array', () => {
      const json = JSON.stringify([]);
      const result = validationService.validateJsonResponse(json);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat data cannot be empty');
    });

    it('should reject valid JSON with invalid chat items', () => {
      const json = JSON.stringify([{ role: 'user' }]); // missing message and name
      const result = validationService.validateJsonResponse(json);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chat item at index 0 is missing required fields');
    });
  });
});
