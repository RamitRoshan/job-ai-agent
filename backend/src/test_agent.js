import { runJobAgent } from './agents/jobAgent.js';
import dotenv from 'dotenv';

dotenv.config();

const test = async () => {
  try {
    console.log('Testing Job Agent directly...');
    console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    const result = await runJobAgent('Backend developer in Bangalore');
    console.log('Agent Result:', result);
  } catch (error) {
    console.error('Agent Test Failed with error:', error);
  }
};

test();
