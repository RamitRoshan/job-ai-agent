import NodeCache from 'node-cache';
import { monitoringService } from './monitoringService.js';

class CacheService {
  constructor() {
    // stdTTL: 1800 seconds (30 minutes)
    // checkperiod: 600 seconds (clean up expired keys every 10 mins)
    this.cache = new NodeCache({ stdTTL: 1800, checkperiod: 600 });
  }

  // Better Query Normalization
  _normalizeQuery(query) {
    if (!query) return '';
    return query
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, ' ')     // Normalize multiple spaces into one
      .trim();
  }

  getCache(query) {
    const normalizedKey = this._normalizeQuery(query);
    const result = this.cache.get(normalizedKey);
    if (result) {
      monitoringService.recordCacheHit();
      console.log(`⚡ Cache HIT for query: "${normalizedKey}"`);
    } else {
      monitoringService.recordCacheMiss();
      console.log(`⏳ Cache MISS for query: "${normalizedKey}"`);
    }
    return result;
  }

  setCache(query, data) {
    const normalizedKey = this._normalizeQuery(query);
    this.cache.set(normalizedKey, data);
    console.log(`💾 Cached result for query: "${normalizedKey}"`);
  }
}

export const cacheService = new CacheService();
