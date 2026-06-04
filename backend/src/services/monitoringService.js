class MonitoringService {
  constructor() {
    this.metrics = {
      requestsPerKey: {},
      totalCacheHits: 0,
      totalCacheMisses: 0,
      totalQuotaErrors: 0,
      totalFallbackSearches: 0
    };
  }

  recordKeyUsage(key) {
    const maskedKey = key ? `${key.substring(0, 6)}...` : 'unknown';
    this.metrics.requestsPerKey[maskedKey] = (this.metrics.requestsPerKey[maskedKey] || 0) + 1;
  }

  recordCacheHit() {
    this.metrics.totalCacheHits++;
  }

  recordCacheMiss() {
    this.metrics.totalCacheMisses++;
  }

  recordQuotaError() {
    this.metrics.totalQuotaErrors++;
  }

  recordFallbackSearch() {
    this.metrics.totalFallbackSearches++;
  }

  getMetrics() {
    return this.metrics;
  }

  logMetrics() {
    console.log('\n📊 [MONITORING METRICS]');
    console.log(`Cache Hits: ${this.metrics.totalCacheHits} | Cache Misses: ${this.metrics.totalCacheMisses}`);
    console.log(`Quota Errors: ${this.metrics.totalQuotaErrors} | Fallbacks: ${this.metrics.totalFallbackSearches}`);
    console.log(`Key Usage:`, this.metrics.requestsPerKey);
    console.log('------------------------\n');
  }
}

export const monitoringService = new MonitoringService();
