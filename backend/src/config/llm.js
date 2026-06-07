import { ChatOpenAI } from "@langchain/openai";

// --- GEMINI/PORTKEY LOGIC (Commented out for future use) ---
// export const getPortkeyLLM = (geminiApiKey) => {
//   const portkeyApiKey = process.env.PORTKEY_API_KEY;
//   const portkeyBaseUrl = process.env.PORTKEY_BASE_URL || "https://api.portkey.ai/v1";
// 
//   return new ChatOpenAI({
//     model: "gemini-2.0-flash",
//     modelName: "gemini-2.0-flash",
//     temperature: 0.1,
//     apiKey: geminiApiKey,
//     maxRetries: 0, // CRITICAL: Disable internal retries so our custom rotation logic handles 429s instantly
//     configuration: {
//       baseURL: portkeyBaseUrl,
//       defaultHeaders: {
//         "x-portkey-api-key": portkeyApiKey,
//         "x-portkey-provider": "google",
//         "x-portkey-config": "pc-config-edc84f",
//       },
//     },
//   });
// };

// --- GROQ LOGIC ---
export const getGroqLLM = (groqApiKey) => {
  return new ChatOpenAI({
    model: "llama-3.1-8b-instant", // Updated active Groq model
    modelName: "llama-3.1-8b-instant",
    temperature: 0.1,
    apiKey: groqApiKey,
    maxRetries: 0, // Disable retries to rely on our custom rotation
    configuration: {
      baseURL: "https://api.groq.com/openai/v1",
    },
  });
};
