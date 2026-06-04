import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { jobSearchTool } from '../tools/jobSearchTool.js';
import { getPortkeyLLM } from '../config/llm.js';
import { keyRotationService, AllKeysExhaustedError } from '../services/keyRotationService.js';

export const runJobAgent = async (userQuery, chatHistory = []) => {
  // 1. Define the tools array
  const tools = [jobSearchTool];

  // 2. Construct the agent system prompt instructions
  const systemPrompt = `You are a smart Job Search AI Assistant.
Extract job details (role, location, salary, experience) and search using tools.
Never hallucinate fake jobs. If tools return no results, suggest similar roles.
Your final response MUST be a valid JSON object matching this structure EXACTLY:
{
  "role": "extracted job role or empty string",
  "location": "extracted location or empty string",
  "jobs": [
    {
      "title": "job title",
      "company": "company name",
      "location": "job location",
      "salary": "salary value",
      "link": "application URL"
    }
  ]
}
Return ONLY raw JSON. No markdown backticks (like \`\`\`json), no extra explanations.`;

  // Convert chatHistory to format expected by LangGraph messages state if present.
  const messages = [];

  if (chatHistory && chatHistory.length > 0) {
    chatHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });
  }

  // Push the latest user query
  messages.push({ role: 'user', content: userQuery });

  // 3. Execute the ReAct agent graph with Portkey LLM, rotation and retry mechanism
  let attempts = 0;
  // Increase maxAttempts to try all keys before failing
  const maxAttempts = 5; 
  let lastError;

  while (attempts < maxAttempts) {
    let currentKey = null;
    try {
      currentKey = await keyRotationService.getNextKey();
      const llm = getPortkeyLLM(currentKey);

      const agent = createReactAgent({
        llm,
        tools,
        stateModifier: systemPrompt,
      });

      const result = await agent.invoke({
        messages: messages,
      }, {
        recursionLimit: 5
      });

      const finalMessage = result.messages[result.messages.length - 1];
      return finalMessage.content;
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error.message);
      lastError = error;

      if (error instanceof AllKeysExhaustedError) {
        throw error;
      }

      const errorMsg = error.message && typeof error.message === 'string' ? error.message.toLowerCase() : String(error.message || "").toLowerCase();
      
      const isRateLimit = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("rate limit") || errorMsg.includes("429 too many requests");

      if (isRateLimit && currentKey) {
        console.log("⚠️ Rate limit or quota error detected. Marking key as disabled...");
        keyRotationService.markKeyAsRateLimited(currentKey, 60); // disable for 60s
      } else {
        console.log("⚠️ Non-quota error detected. We will still retry anyway just to be safe.");
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Waiting 1.5s before retrying with next key...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw new Error(`Agent failed to process query after ${maxAttempts} attempts with key rotation. Last error: ${lastError.message}`);
};
