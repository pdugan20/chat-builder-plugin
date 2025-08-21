export default class AdaptiveStreamBuffer {
  private buffer: string = '';
  private bufferTimer: ReturnType<typeof setTimeout> | null = null;
  private messageRate: number[] = [];
  private lastMessageTime: number = Date.now();
  private baseDelay: number = 100;
  private currentDelay: number = 100;
  private minDelay: number = 50;
  private maxDelay: number = 500;
  private onFlush: (content: string) => void;

  constructor(onFlush: (content: string) => void) {
    this.onFlush = onFlush;
  }

  append(chunk: string): void {
    this.buffer += chunk;
    this.updateMessageRate();
    this.scheduleFlush();
  }

  private updateMessageRate(): void {
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;
    this.lastMessageTime = now;

    this.messageRate.push(timeSinceLastMessage);
    if (this.messageRate.length > 10) {
      this.messageRate.shift();
    }

    this.adjustDelay();
  }

  private adjustDelay(): void {
    if (this.messageRate.length < 3) {
      this.currentDelay = this.baseDelay;
      return;
    }

    const avgRate = this.messageRate.reduce((a, b) => a + b, 0) / this.messageRate.length;

    if (avgRate < 100) {
      this.currentDelay = Math.min(this.currentDelay * 1.2, this.maxDelay);
    } else if (avgRate > 300) {
      this.currentDelay = Math.max(this.currentDelay * 0.8, this.minDelay);
    } else {
      this.currentDelay = this.baseDelay;
    }
  }

  private scheduleFlush(): void {
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
    }

    this.bufferTimer = setTimeout(() => {
      this.flush();
    }, this.currentDelay);
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    const content = this.buffer;
    this.buffer = '';
    this.bufferTimer = null;
    this.onFlush(content);
  }

  forceFlush(): void {
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
    this.flush();
  }

  reset(): void {
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
    this.buffer = '';
    this.messageRate = [];
    this.currentDelay = this.baseDelay;
  }

  getStats(): {
    currentDelay: number;
    bufferSize: number;
    avgMessageRate: number;
  } {
    const avgRate =
      this.messageRate.length > 0 ? this.messageRate.reduce((a, b) => a + b, 0) / this.messageRate.length : 0;

    return {
      currentDelay: this.currentDelay,
      bufferSize: this.buffer.length,
      avgMessageRate: avgRate,
    };
  }
}
