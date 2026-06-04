import { monitoringService } from './monitoringService.js';
import { getPortkeyLLM } from '../config/llm.js';

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
  async initialize() {
    if (this.isInitialized) return;

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
      this.isInitialized = true;
      return;
    }

    console.log(`\n🔍 Performing Startup Health Check on ${rawKeys.length} Gemini API Keys...`);
    this.keys = [];

    for (let index = 0; index < rawKeys.length; index++) {
      const apiKey = rawKeys[index];
      const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 6)}...` : '***';
      let isHealthy = false;
      
      const startTime = Date.now();
      let isTimeout = false;
      try {
        console.log(`\n⏳ [Key ${index + 1}] Starting request for key ${maskedKey}...`);
        const llm = getPortkeyLLM(apiKey);
        
        // AbortController to prevent hanging forever
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          isTimeout = true;
          controller.abort();
        }, 30000); // Increased timeout to 30 seconds
        
        await llm.invoke("respond with exactly one word: 'ok'", { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const timeTaken = Date.now() - startTime;
        isHealthy = true;
        console.log(`✅ [Key ${index + 1}] Request ended successfully. Time taken: ${timeTaken}ms`);
      } catch (err) {
        const timeTaken = Date.now() - startTime;
        console.log(`❌ [Key ${index + 1}] Request failed. Time taken: ${timeTaken}ms`);
        console.log(`⚠️ Full Error for Key ${index + 1}:`, err);
        if (err.response && err.response.data) {
          console.log(`⚠️ Actual Gemini/Portkey Response Data:`, JSON.stringify(err.response.data, null, 2));
        }
      }

      this.keys.push({
        key: apiKey,
        // If it was just a local timeout, let's keep it healthy so we don't accidentally kill a perfectly good key due to a local network blip
        isHealthy: isHealthy || isTimeout,
        // Disable for 1 hour only if it's a confirmed hard failure (like 429 quota or 401 unauthorized), not a timeout
        disabledUntil: (isHealthy || isTimeout) ? null : Date.now() + (60 * 60 * 1000),
        consecutiveFailures: (isHealthy || isTimeout) ? 0 : 1
      });
    }

    this.isInitialized = true;
    const healthyCount = this.keys.filter(k => k.isHealthy).length;
    console.log(`✅ Startup Check Complete. ${healthyCount}/${this.keys.length} keys are ready for rotation.\n`);
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

  async getNextKey() {
    if (!this.isInitialized) await this.initialize();
    
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
