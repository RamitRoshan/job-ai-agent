import dotenv from 'dotenv';
dotenv.config();

import { getGeminiKeysList, getNextGeminiKey } from './src/utils/getGeminiKey.js';
import { getPortkeyLLM } from './src/config/llm.js';

async function test() {
  console.log("Keys found:", getGeminiKeysList());
  const key1 = getNextGeminiKey();
  const key2 = getNextGeminiKey();
  console.log("Next Key 1:", key1);
  console.log("Next Key 2:", key2);

  const llm = getPortkeyLLM(key1);
  try {
    const res = await llm.invoke("Hello, who are you?");
    console.log("LLM Response:", res.content);
  } catch (err) {
    console.error("LLM Error:", err.message);
  }
}

test();
