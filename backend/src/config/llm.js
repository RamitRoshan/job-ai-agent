import { ChatOpenAI } from "@langchain/openai";

export const getPortkeyLLM = (geminiApiKey) => {
  const portkeyApiKey = process.env.PORTKEY_API_KEY;
  const portkeyBaseUrl = process.env.PORTKEY_BASE_URL || "https://api.portkey.ai/v1";

  return new ChatOpenAI({
    model: "gemini-2.0-flash",
    modelName: "gemini-2.0-flash",
    temperature: 0.1,
    apiKey: geminiApiKey,
    configuration: {
      baseURL: portkeyBaseUrl,
      defaultHeaders: {
        "x-portkey-api-key": portkeyApiKey,
        "x-portkey-provider": "google",
        "x-portkey-config": "pc-config-edc84f",
      },
    },
  });
};
