interface ParseMessage {
  type: 'parse';
  data: string;
  id: string;
}

interface ParseResult {
  type: 'result';
  id: string;
  success: boolean;
  data?: any;
  error?: string;
}

function cleanJsonString(input: string): string {
  let cleaned = input.trim();

  cleaned = cleaned.replace(/^```json?\s*/, '').replace(/```\s*$/, '');
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  const jsonStart = cleaned.search(/[\[{]/);
  const jsonEnd = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));

  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  cleaned = cleaned.replace(/([^"\\])\\n/g, '$1\\\\n');
  cleaned = cleaned.replace(/([^"\\])\\t/g, '$1\\\\t');

  return cleaned;
}

function attemptJsonParse(input: string): any {
  const cleaned = cleanJsonString(input);

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    try {
      const withQuotes = cleaned.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
      return JSON.parse(withQuotes);
    } catch (secondError) {
      try {
        const singleToDouble = cleaned.replace(/'/g, '"');
        return JSON.parse(singleToDouble);
      } catch (thirdError) {
        const truncated = cleaned.substring(0, Math.min(200, cleaned.length));
        throw new Error(`Failed to parse JSON: ${truncated}...`);
      }
    }
  }
}

self.addEventListener('message', (event: MessageEvent<ParseMessage>) => {
  const { type, data, id } = event.data;

  if (type !== 'parse') return;

  try {
    const parsed = attemptJsonParse(data);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Parsed result is not a valid object');
    }

    const result: ParseResult = {
      type: 'result',
      id,
      success: true,
      data: parsed,
    };

    self.postMessage(result);
  } catch (error) {
    const result: ParseResult = {
      type: 'result',
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    };

    self.postMessage(result);
  }
});

export {};
