class QueueService {
  constructor(concurrencyLimit = 1) {
    this.concurrencyLimit = concurrencyLimit;
    this.runningCount = 0;
    this.queue = [];
  }

  async enqueue(taskFn) {
    if (this.runningCount >= this.concurrencyLimit) {
      console.log(`🚦 Request queued. Currently running: ${this.runningCount}/${this.concurrencyLimit}`);
      await new Promise((resolve) => this.queue.push(resolve));
    }

    this.runningCount++;
    try {
      return await taskFn();
    } finally {
      this.runningCount--;
      if (this.queue.length > 0) {
        // Dequeue next task
        const nextResolve = this.queue.shift();
        nextResolve();
      }
    }
  }
}

// Global queue for Gemini requests
export const geminiQueueService = new QueueService(1);
