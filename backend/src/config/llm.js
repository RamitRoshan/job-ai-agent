import { ChatOpenAI } from "@langchain/openai";

export const getPortkeyLLM = (geminiApiKey) => {
  const portkeyApiKey = process.env.PORTKEY_API_KEY;
  const portkeyBaseUrl = process.env.PORTKEY_BASE_URL || "https://api.portkey.ai/v1";

  return new ChatOpenAI({
    modelName: "gemini-1.5-flash",
    temperature: 0.1,
    apiKey: geminiApiKey,
    configuration: {
      baseURL: portkeyBaseUrl,
      defaultHeaders: {
        "x-portkey-api-key": portkeyApiKey,
        "x-portkey-provider": "google",
      },
    },
  });
};
