import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { jobSearchTool } from '../tools/jobSearchTool.js';
import { getPortkeyLLM } from '../config/llm.js';
import { getNextGeminiKey } from '../utils/getGeminiKey.js';

export const runJobAgent = async (userQuery, chatHistory = []) => {
  // 1. Define the tools array
  const tools = [jobSearchTool];

  // 2. Construct the agent system prompt instructions
  const systemPrompt = `You are a smart Job Search AI Assistant.

Understand user queries and extract job-related information such as role, location, salary, and experience.

Use tools to fetch job listings and return structured results.

Never hallucinate fake jobs. If the tool returns no jobs, you should try searching for similar/broader roles using the tool.
If still no results are found, suggest similar roles in the "jobs" array using mock suggestions, or keep the list empty but note that they are suggestions.

Your final response MUST be a valid JSON object matching this structure EXACTLY:
{
  "role": "extracted job role or empty string if not found",
  "location": "extracted location or empty string if not found",
  "jobs": [
    {
      "title": "job title",
      "company": "company name",
      "location": "job location",
      "salary": "salary value (e.g. 10 LPA)",
      "link": "application URL link"
    }
  ]
}

CRITICAL: Return ONLY raw JSON, with no markdown backticks like \`\`\`json, no explanations, no text before or after the JSON. If the response contains markdown backticks or formatting, it will crash the parser.`;

  // Convert chatHistory to format expected by LangGraph messages state if present.
  // Standard format is role/content array.
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
  const maxAttempts = 3;
  let lastError;

  while (attempts < maxAttempts) {
    try {
      const apiKey = getNextGeminiKey();
      const llm = getPortkeyLLM(apiKey);

      const agent = createReactAgent({
        llm,
        tools,
        stateModifier: systemPrompt,
      });

      const result = await agent.invoke({
        messages: messages,
      });

      const finalMessage = result.messages[result.messages.length - 1];
      return finalMessage.content;
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed using key rotation:`, error.message);
      lastError = error;
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Waiting 1.5s before retrying with next key...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw new Error(`Agent failed to process query after ${maxAttempts} attempts with key rotation. Last error: ${lastError.message}`);
};
