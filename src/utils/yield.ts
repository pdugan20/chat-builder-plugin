/**
 * Utility functions for yielding control back to the main thread
 * Based on Figma's recommendations for preventing plugin freezing
 */

/**
 * Yields control back to the main thread to prevent UI freezing
 * Use this between heavy operations
 */
export async function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * Process items in chunks with yielding between each chunk
 * Prevents UI freezing when processing large arrays
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T, index: number) => R | Promise<R>,
  chunkSize: number = 5
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Process chunk
    const chunkResults = await Promise.all(
      chunk.map((item, index) => processor(item, i + index))
    );
    
    results.push(...chunkResults);
    
    // Yield to main thread between chunks
    if (i + chunkSize < items.length) {
      await yieldToMainThread();
    }
  }
  
  return results;
}

/**
 * Executes a function with periodic yielding
 * Useful for long-running operations that can't be easily chunked
 */
export async function withYielding<T>(
  fn: () => T | Promise<T>,
  yieldInterval: number = 100
): Promise<T> {
  const startTime = Date.now();
  const result = await fn();
  
  // Yield if operation took longer than threshold
  if (Date.now() - startTime > yieldInterval) {
    await yieldToMainThread();
  }
  
  return result;
}

/**
 * Batch operations with automatic yielding
 * Groups operations and yields between batches
 */
export class BatchProcessor<T> {
  private queue: Array<() => T | Promise<T>> = [];
  private batchSize: number;
  private processing = false;

  constructor(batchSize: number = 10) {
    this.batchSize = batchSize;
  }

  add(operation: () => T | Promise<T>): void {
    this.queue.push(operation);
  }

  async processAll(): Promise<T[]> {
    if (this.processing) {
      throw new Error('Batch processor is already running');
    }

    this.processing = true;
    const results: T[] = [];

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        
        // Process batch
        const batchResults = await Promise.all(
          batch.map(op => op())
        );
        
        results.push(...batchResults);
        
        // Yield between batches
        if (this.queue.length > 0) {
          await yieldToMainThread();
        }
      }
    } finally {
      this.processing = false;
    }

    return results;
  }

  clear(): void {
    this.queue = [];
  }
}