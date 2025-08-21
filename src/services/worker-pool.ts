/**
 * Worker pool for managing multiple WebWorker instances
 * Improves performance by distributing tasks across workers
 */

interface WorkerTask {
  id: string;
  type: string;
  data: any;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout?: ReturnType<typeof setTimeout>;
}

export class WorkerPool {
  private static instance: WorkerPool;
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: WorkerTask[] = [];
  private activeTasks = new Map<string, WorkerTask>();
  private maxWorkers: number;
  private workerScript: string;

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = Math.min(maxWorkers, 4); // Cap at 4 workers
    this.workerScript = this.createWorkerScript();
    this.initializeWorkers();
  }

  static getInstance(): WorkerPool {
    if (!WorkerPool.instance) {
      WorkerPool.instance = new WorkerPool();
    }
    return WorkerPool.instance;
  }

  private createWorkerScript(): string {
    // Inline worker script to avoid bundling issues
    return `
      const parseJSON = ${parseJSONFunction.toString()};
      const processChatData = ${processChatDataFunction.toString()};
      const validateMessages = ${validateMessagesFunction.toString()};
      const prepareBatch = ${prepareBatchFunction.toString()};
      
      self.addEventListener('message', (event) => {
        const { id, type, data } = event.data;
        
        try {
          let result;
          
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
              throw new Error('Unknown message type: ' + type);
          }
          
          self.postMessage({ id, success: true, result });
        } catch (error) {
          self.postMessage({ 
            id, 
            success: false, 
            error: error.message || String(error) 
          });
        }
      });
    `;
  }

  private initializeWorkers(): void {
    const blob = new Blob([this.workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    for (let i = 0; i < this.maxWorkers; i += 1) {
      try {
        const worker = new Worker(workerUrl);

        worker.addEventListener('message', (event) => {
          const { id, success, result, error } = event.data;
          const task = this.activeTasks.get(id);

          if (task) {
            this.activeTasks.delete(id);
            if (task.timeout) clearTimeout(task.timeout);

            if (success) {
              task.resolve(result);
            } else {
              task.reject(new Error(error));
            }

            // Return worker to pool
            this.availableWorkers.push(worker);
            this.processNextTask();
          }
        });

        worker.addEventListener('error', (error) => {
          // Worker error handled by rejection
          // Recreate the worker if it errors
          this.replaceWorker(worker);
        });

        this.workers.push(worker);
        this.availableWorkers.push(worker);
      } catch (error) {
        // Failed to create worker, continue with remaining workers
      }
    }
  }

  private replaceWorker(faultyWorker: Worker): void {
    const index = this.workers.indexOf(faultyWorker);
    if (index !== -1) {
      try {
        faultyWorker.terminate();
      } catch {}

      // Create a new worker
      const blob = new Blob([this.workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const newWorker = new Worker(workerUrl);

      this.workers[index] = newWorker;
      this.availableWorkers.push(newWorker);
    }
  }

  private processNextTask(): void {
    if (this.taskQueue.length === 0 || this.availableWorkers.length === 0) {
      return;
    }

    const task = this.taskQueue.shift()!;
    const worker = this.availableWorkers.shift()!;

    this.activeTasks.set(task.id, task);

    // Set timeout for task
    task.timeout = setTimeout(() => {
      this.activeTasks.delete(task.id);
      task.reject(new Error('Worker task timeout'));
      this.availableWorkers.push(worker);
      this.processNextTask();
    }, 10000); // 10 second timeout

    worker.postMessage({
      id: task.id,
      type: task.type,
      data: task.data,
    });
  }

  async execute<T>(type: string, data: any): Promise<T> {
    const id = Math.random().toString(36).substr(2, 9);

    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id,
        type,
        data,
        resolve,
        reject,
      };

      this.taskQueue.push(task);
      this.processNextTask();
    });
  }

  async executeMany<T>(tasks: Array<{ type: string; data: any }>): Promise<T[]> {
    return Promise.all(tasks.map((task) => this.execute<T>(task.type, task.data)));
  }

  getStatus(): {
    totalWorkers: number;
    availableWorkers: number;
    activeTasks: number;
    queuedTasks: number;
  } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
    };
  }

  terminate(): void {
    this.workers.forEach((worker) => {
      try {
        worker.terminate();
      } catch {}
    });

    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.activeTasks.clear();
  }
}

// Worker functions (extracted for inline script)
function parseJSONFunction(input: string): any {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^```json?\s*/, '').replace(/```\s*$/, '');
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  const jsonStart = cleaned.search(/[\[{]/);
  const jsonEnd = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));

  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      return JSON.parse(cleaned.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'));
    } catch {
      return JSON.parse(cleaned.replace(/'/g, '"'));
    }
  }
}

function processChatDataFunction(rawData: any): any {
  if (!Array.isArray(rawData)) {
    throw new Error('Chat data must be an array');
  }

  return rawData.map((item, index) => ({
    ...item,
    role: item.role?.toLowerCase(),
    message: item.message?.trim(),
    name: item.name || 'Unknown',
    gender: item.gender || 'neutral',
    messagesInGroup: item.messagesInGroup || 1,
    index,
  }));
}

function validateMessagesFunction(messages: any[]): any {
  const valid: any[] = [];
  const invalid: any[] = [];

  for (const msg of messages) {
    if (msg.message.length > 5000) {
      invalid.push({ ...msg, error: 'Message too long' });
    } else if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(msg.message)) {
      invalid.push({ ...msg, error: 'Invalid characters' });
    } else {
      valid.push(msg);
    }
  }

  return { valid, invalid };
}

function prepareBatchFunction(messages: any[], batchSize: number): any[][] {
  const batches: any[][] = [];

  for (let i = 0; i < messages.length; i += batchSize) {
    batches.push(messages.slice(i, i + batchSize));
  }

  return batches;
}
