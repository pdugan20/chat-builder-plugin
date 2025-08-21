export class JsonParserService {
  private static instance: JsonParserService;
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
    }
  >();

  static getInstance(): JsonParserService {
    if (!JsonParserService.instance) {
      JsonParserService.instance = new JsonParserService();
    }
    return JsonParserService.instance;
  }

  private constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    try {
      const workerCode = `
        function cleanJsonString(input) {
          let cleaned = input.trim();
          cleaned = cleaned.replace(/^\`\`\`json?\\s*/, '').replace(/\`\`\`\\s*$/, '');
          cleaned = cleaned.replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, '');
          
          const jsonStart = cleaned.search(/[\\[{]/);
          const jsonEnd = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
          
          if (jsonStart !== -1 && jsonEnd !== -1) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
          }
          
          cleaned = cleaned.replace(/,\\s*([}\\]])/g, '$1');
          cleaned = cleaned.replace(/([^"\\\\])\\\\n/g, '$1\\\\\\\\n');
          cleaned = cleaned.replace(/([^"\\\\])\\\\t/g, '$1\\\\\\\\t');
          
          return cleaned;
        }

        function attemptJsonParse(input) {
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
                throw new Error('Failed to parse JSON: ' + truncated + '...');
              }
            }
          }
        }

        self.addEventListener('message', (event) => {
          const { type, data, id } = event.data;
          
          if (type !== 'parse') return;
          
          try {
            const parsed = attemptJsonParse(data);
            
            if (!parsed || typeof parsed !== 'object') {
              throw new Error('Parsed result is not a valid object');
            }
            
            self.postMessage({
              type: 'result',
              id,
              success: true,
              data: parsed,
            });
          } catch (error) {
            self.postMessage({
              type: 'result',
              id,
              success: false,
              error: error.message || 'Unknown parsing error',
            });
          }
        });
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);

      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));
    } catch (error) {
      // Failed to initialize WebWorker, falling back to main thread parsing
      this.worker = null;
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, id, success, data, error } = event.data;

    if (type !== 'result') return;

    const pending = this.pendingRequests.get(id);
    if (!pending) return;

    this.pendingRequests.delete(id);

    if (success) {
      pending.resolve(data);
    } else {
      pending.reject(new Error(error));
    }
  }

  private handleWorkerError(error: ErrorEvent): void {
    // Worker error occurred
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error('Worker error occurred'));
    });
    this.pendingRequests.clear();
  }

  async parse(jsonString: string): Promise<any> {
    if (!this.worker) {
      return this.fallbackParse(jsonString);
    }

    const id = Math.random().toString(36).substr(2, 9);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('JSON parsing timeout'));
      }, 5000);

      this.pendingRequests.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      this.worker!.postMessage({
        type: 'parse',
        data: jsonString,
        id,
      });
    });
  }

  private fallbackParse(jsonString: string): any {
    let cleaned = jsonString.trim();

    cleaned = cleaned.replace(/^```json?\s*/, '').replace(/```\s*$/, '');
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    const jsonStart = cleaned.search(/[\[{]/);
    const jsonEnd = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      const withQuotes = cleaned.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
      return JSON.parse(withQuotes);
    }
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}
