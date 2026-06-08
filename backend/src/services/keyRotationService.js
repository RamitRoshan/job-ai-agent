import { monitoringService } from './monitoringService.js';
// import { getPortkeyLLM } from '../config/llm.js';
import { getGroqLLM, getOpenAILLM } from '../config/llm.js';

export class AllKeysExhaustedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AllKeysExhaustedError';
  }
}

class KeyRotationService {
  constructor() {
    this.keys = [];
    this.isInitialized = false;
  }

  // Startup Key Health Check
  async initialize() {
    if (this.isInitialized) return;

    const rawKeys = [];
    
    // 1. Load Groq Keys
    let i = 1;
    while (true) {
      const key = process.env[`GROQ_KEY_${i}`];
      if (!key) break;
      rawKeys.push({ key, provider: 'groq' });
      i++;
    }
    if (rawKeys.length === 0 && process.env.GROQ_API_KEY) {
      rawKeys.push({ key: process.env.GROQ_API_KEY, provider: 'groq' });
    }

    // 2. Load OpenAI Keys
    i = 1;
    while (true) {
      const key = process.env[`OPENAI_KEY${i}`];
      if (!key) break;
      rawKeys.push({ key, provider: 'openai' });
      i++;
    }

    if (rawKeys.length === 0) {
      console.error("❌ No API keys found in environment variables.");
      this.isInitialized = true;
      return;
    }

    console.log(`\n🔍 Performing Startup Health Check on ${rawKeys.length} API Keys...`);
    this.keys = [];

    for (let index = 0; index < rawKeys.length; index++) {
      const { key: apiKey, provider } = rawKeys[index];
      const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 6)}...` : '***';
      let isHealthy = false;

      const startTime = Date.now();
      let isTimeout = false;
      try {
        console.log(`\n⏳ [Key ${index + 1}] Starting request for ${provider} key ${maskedKey}...`);

        const llm = provider === 'groq' ? getGroqLLM(apiKey) : getOpenAILLM(apiKey);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          isTimeout = true;
          controller.abort();
        }, 30000); 

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
          console.log(`⚠️ Actual API Response Data:`, JSON.stringify(err.response.data, null, 2));
        }
      }

      this.keys.push({
        key: apiKey,
        provider: provider,
        isHealthy: isHealthy || isTimeout,
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
        console.log(`🔄 Key [${keyObj.key.substring(0, 6)}...] (${keyObj.provider}) has recovered from cooldown and is now healthy.`);
      }
    }
  }

  async getNextKey() {
    if (!this.isInitialized) await this.initialize();

    this._refreshKeyStatus();

    if (this.keys.length === 0) {
      throw new AllKeysExhaustedError("No keys configured.");
    }

    const now = Date.now();
    const GROQ_RPM_LIMIT = 28;
    const OPENAI_RPM_LIMIT = 500; // Typical higher limit for OpenAI
    
    // Group keys
    const groqKeys = this.keys.filter(k => k.provider === 'groq');
    const openaiKeys = this.keys.filter(k => k.provider === 'openai');

    // Helper to find next healthy key in a pool
    const findKeyInPool = (pool, rpmLimit) => {
      let bestKey = null;
      let minRequests = Infinity;
      
      for (const keyObj of pool) {
        if (!keyObj.requestTimestamps) {
          keyObj.requestTimestamps = [];
        }
        keyObj.requestTimestamps = keyObj.requestTimestamps.filter(t => now - t < 60000);
        
        if (keyObj.isHealthy && keyObj.requestTimestamps.length < rpmLimit) {
          if (keyObj.requestTimestamps.length < minRequests) {
            minRequests = keyObj.requestTimestamps.length;
            bestKey = keyObj;
          }
        }
      }
      return bestKey;
    };

    let selectedKeyObj = findKeyInPool(groqKeys, GROQ_RPM_LIMIT);
    
    if (!selectedKeyObj) {
      // If Groq is exhausted, fallback to OpenAI
      selectedKeyObj = findKeyInPool(openaiKeys, OPENAI_RPM_LIMIT);
    }

    if (selectedKeyObj) {
      selectedKeyObj.requestTimestamps.push(now);
      monitoringService.recordKeyUsage(selectedKeyObj.key);
      return { key: selectedKeyObj.key, provider: selectedKeyObj.provider };
    }

    throw new AllKeysExhaustedError("All API keys are currently rate-limited, disabled, or have reached their per-minute limits.");
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
      console.warn(`🛑 Circuit Breaker: Key [${apiKey.substring(0, 6)}...] disabled for ${cooldown / 1000}s due to quota/rate limit.`);
    }
  }
}

export const keyRotationService = new KeyRotationService();
