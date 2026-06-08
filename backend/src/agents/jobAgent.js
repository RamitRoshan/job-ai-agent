import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { jobSearchTool } from '../tools/jobSearchTool.js';
// import { getPortkeyLLM } from '../config/llm.js';
import { getGroqLLM, getOpenAILLM } from '../config/llm.js';
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
      if (msg.sender === 'user') {
        messages.push(new HumanMessage(msg.text));
      } else {
        messages.push(new AIMessage(msg.text));
      }
    });
  }

  // Push the latest user query
  messages.push(new HumanMessage(userQuery));

  // 3. Execute the tool calling loop with Groq LLM, rotation and retry mechanism
  let attempts = 0;
  // Increase maxAttempts to try all keys before failing
  const maxAttempts = 5; 
  let lastError;

  while (attempts < maxAttempts) {
    let currentKey = null;
    try {
      const keyInfo = await keyRotationService.getNextKey();
      currentKey = keyInfo.key;
      const provider = keyInfo.provider;
      const llm = provider === 'groq' ? getGroqLLM(currentKey) : getOpenAILLM(currentKey);

      // Bind tools to the LLM
      const llmWithTools = llm.bindTools(tools);

      // Prepare the message array
      const conversation = [
        new SystemMessage(systemPrompt),
        ...messages
      ];

      // Step 1: Let the LLM decide if it needs to call a tool
      const aiMsg = await llmWithTools.invoke(conversation);

      if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
        // Step 2: Execute the tool manually
        const toolMessages = [];
        for (const toolCall of aiMsg.tool_calls) {
          const toolResult = await jobSearchTool.invoke(toolCall.args);
          // In raw LangChain, tool results are just passed as ToolMessages
          toolMessages.push(new ToolMessage({
            content: toolResult,
            tool_call_id: toolCall.id,
            name: toolCall.name
          }));
        }

        // Step 3: Send the tool results back to the LLM to format the final JSON
        const finalResponse = await llm.invoke([
          ...conversation,
          aiMsg,
          ...toolMessages
        ]);
        
        return finalResponse.content;
      } else {
        // LLM answered directly
        return aiMsg.content;
      }
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed with error:`, error);
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
