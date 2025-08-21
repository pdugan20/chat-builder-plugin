/**
 * WebWorker for heavy chat processing operations
 * Offloads CPU-intensive tasks from the main thread
 */

interface WorkerMessage {
  id: string;
  type: 'PARSE_JSON' | 'PROCESS_CHAT_DATA' | 'VALIDATE_MESSAGES' | 'PREPARE_BATCH';
  data: any;
}

interface WorkerResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

// JSON parsing with multiple fallback strategies
function parseJSON(input: string): any {
  let cleaned = input.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```json?\s*/, '').replace(/```\s*$/, '');
  
  // Remove control characters
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
  // Extract JSON portion
  const jsonStart = cleaned.search(/[\[{]/);
  const jsonEnd = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  
  // Try multiple parsing strategies
  const strategies = [
    (s: string) => JSON.parse(s),
    (s: string) => JSON.parse(s.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')),
    (s: string) => JSON.parse(s.replace(/'/g, '"')),
  ];
  
  for (const strategy of strategies) {
    try {
      return strategy(cleaned);
    } catch {
      continue;
    }
  }
  
  throw new Error('Failed to parse JSON after all strategies');
}

// Process and validate chat data
function processChatData(rawData: any): any {
  // Validate structure
  if (!Array.isArray(rawData)) {
    throw new Error('Chat data must be an array');
  }
  
  // Process each message
  const processed = rawData.map((item, index) => {
    // Ensure required fields
    if (!item.role || !item.message) {
      throw new Error(`Invalid message at index ${index}`);
    }
    
    // Normalize data
    return {
      ...item,
      role: item.role.toLowerCase(),
      message: item.message.trim(),
      name: item.name || 'Unknown',
      gender: item.gender || 'neutral',
      messagesInGroup: item.messagesInGroup || 1,
      timestamp: item.timestamp || Date.now(),
      index,
    };
  });
  
  // Group consecutive messages from same sender
  const grouped: any[] = [];
  let currentGroup: any[] = [];
  let lastSender = '';
  
  for (const item of processed) {
    if (item.role === lastSender && currentGroup.length < 3) {
      currentGroup.push(item);
    } else {
      if (currentGroup.length > 0) {
        grouped.push(...currentGroup.map((msg, i) => ({
          ...msg,
          messagesInGroup: currentGroup.length,
          groupIndex: i,
        })));
      }
      currentGroup = [item];
      lastSender = item.role;
    }
  }
  
  if (currentGroup.length > 0) {
    grouped.push(...currentGroup.map((msg, i) => ({
      ...msg,
      messagesInGroup: currentGroup.length,
      groupIndex: i,
    })));
  }
  
  return grouped;
}

// Validate message batch before sending to Figma
function validateMessages(messages: any[]): { valid: any[]; invalid: any[] } {
  const valid: any[] = [];
  const invalid: any[] = [];
  
  for (const msg of messages) {
    try {
      // Check message length
      if (msg.message.length > 5000) {
        invalid.push({ ...msg, error: 'Message too long' });
        continue;
      }
      
      // Check for invalid characters that might break Figma
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(msg.message)) {
        invalid.push({ ...msg, error: 'Invalid characters' });
        continue;
      }
      
      valid.push(msg);
    } catch (error) {
      invalid.push({ ...msg, error: String(error) });
    }
  }
  
  return { valid, invalid };
}

// Prepare messages for batch processing
function prepareBatch(messages: any[], batchSize: number): any[][] {
  const batches: any[][] = [];
  
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    
    // Add batch metadata
    batches.push(batch.map((msg, index) => ({
      ...msg,
      batchIndex: Math.floor(i / batchSize),
      indexInBatch: index,
      totalBatches: Math.ceil(messages.length / batchSize),
    })));
  }
  
  return batches;
}

// Handle incoming messages
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { id, type, data } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'PARSE_JSON':
        result = parseJSON(data);
        break;
        
      case 'PROCESS_CHAT_DATA':
        const parsed = typeof data === 'string' ? parseJSON(data) : data;
        result = processChatData(parsed);
        break;
        
      case 'VALIDATE_MESSAGES':
        result = validateMessages(data);
        break;
        
      case 'PREPARE_BATCH':
        result = prepareBatch(data.messages, data.batchSize || 5);
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    const response: WorkerResponse = {
      id,
      success: true,
      result,
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
    
    self.postMessage(response);
  }
});

export {};