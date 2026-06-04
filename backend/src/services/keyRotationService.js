import { monitoringService } from './monitoringService.js';

export class AllKeysExhaustedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AllKeysExhaustedError';
  }
}

class KeyRotationService {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.isInitialized = false;
  }

  // Startup Key Health Check
  initialize() {
    const rawKeys = [];
    let i = 1;
    while (true) {
      const key = process.env[`GEMINI_KEY_${i}`];
      if (!key) break;
      rawKeys.push(key);
      i++;
    }

    if (rawKeys.length === 0 && process.env.GEMINI_API_KEY) {
      rawKeys.push(process.env.GEMINI_API_KEY);
    }

    if (rawKeys.length === 0) {
      console.error("❌ No Gemini API keys found in environment variables.");
    }

    this.keys = rawKeys.map(key => ({
      key,
      isHealthy: true,
      disabledUntil: null,
      consecutiveFailures: 0
    }));

    this.isInitialized = true;
    console.log(`✅ KeyRotationService initialized with ${this.keys.length} keys.`);
  }

  _refreshKeyStatus() {
    const now = Date.now();
    for (const keyObj of this.keys) {
      if (!keyObj.isHealthy && keyObj.disabledUntil && now >= keyObj.disabledUntil) {
        keyObj.isHealthy = true;
        keyObj.disabledUntil = null;
        keyObj.consecutiveFailures = 0; // Reset circuit breaker
        console.log(`🔄 Key [${keyObj.key.substring(0, 6)}...] has recovered from cooldown and is now healthy.`);
      }
    }
  }

  getNextKey() {
    if (!this.isInitialized) this.initialize();
    
    this._refreshKeyStatus();

    if (this.keys.length === 0) {
      throw new AllKeysExhaustedError("No keys configured.");
    }

    let attempts = 0;
    while (attempts < this.keys.length) {
      const keyObj = this.keys[this.currentIndex];
      
      // Move index to next for next call (Round Robin)
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;

      if (keyObj.isHealthy) {
        monitoringService.recordKeyUsage(keyObj.key);
        return keyObj.key;
      }
      
      attempts++;
    }

    throw new AllKeysExhaustedError("All Gemini API keys are currently rate-limited or disabled.");
  }

  // Retry-After Based Cooldown & Circuit Breaker Pattern
  markKeyAsRateLimited(apiKey, retryAfterSeconds = 60) {
    const keyObj = this.keys.find(k => k.key === apiKey);
    if (keyObj) {
      keyObj.consecutiveFailures += 1;
      keyObj.isHealthy = false;
      
      // Circuit breaker logic: exponential backoff if it keeps failing immediately after recovery
      let cooldown = retryAfterSeconds * 1000;
      if (keyObj.consecutiveFailures > 1) {
         cooldown = cooldown * keyObj.consecutiveFailures; // e.g. 60s -> 120s -> 180s
      }

      keyObj.disabledUntil = Date.now() + cooldown;
      monitoringService.recordQuotaError();
      console.warn(`🛑 Circuit Breaker: Key [${apiKey.substring(0, 6)}...] disabled for ${cooldown/1000}s due to quota/rate limit.`);
    }
  }
}

export const keyRotationService = new KeyRotationService();
