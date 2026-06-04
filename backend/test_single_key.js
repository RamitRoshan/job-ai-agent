import dotenv from 'dotenv';
import { getPortkeyLLM } from './src/config/llm.js';

dotenv.config();

const testSingleKey = async () => {
  const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found to test.");
    return;
  }

  const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 6)}...` : '***';
  console.log(`\n🧪 Testing single Gemini Key: ${maskedKey} outside of health check service...`);
  
  const llm = getPortkeyLLM(apiKey);
  
  try {
    const startTime = Date.now();
    console.log(`⏳ Sending request via Portkey to Gemini 2.0 Flash...`);
    
    // We will NOT use an AbortController here, so we can see if it hangs natively
    const result = await llm.invoke("respond with exactly one word: 'ok'");
    
    const timeTaken = Date.now() - startTime;
    console.log(`✅ Success! Received response: "${result.content}" in ${timeTaken}ms`);
  } catch (err) {
    console.error(`❌ Request Failed:`, err);
    if (err.response && err.response.data) {
      console.error(`⚠️ Response Data:`, JSON.stringify(err.response.data, null, 2));
    }
  }
};

testSingleKey();
