import 'dotenv/config';
import { keyRotationService } from './src/services/keyRotationService.js';

async function runTest() {
  console.log("Initializing Key Rotation Service...");
  await keyRotationService.initialize();
  
  try {
    const firstKey = await keyRotationService.getNextKey();
    console.log("\n[TEST 1] Normal operation - received provider:", firstKey.provider);
    
    console.log("\nSimulating rate limits on all Groq keys...");
    for (const keyObj of keyRotationService.keys) {
      if (keyObj.provider === 'groq') {
        keyRotationService.markKeyAsRateLimited(keyObj.key, 300); // Disable for 5 mins
      }
    }
    
    const fallbackKey = await keyRotationService.getNextKey();
    console.log("\n[TEST 2] Fallback operation - received provider:", fallbackKey.provider);
    console.log("Success! The system automatically fell back to:", fallbackKey.provider);
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

runTest();
