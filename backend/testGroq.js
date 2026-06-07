import { ChatOpenAI } from "@langchain/openai";

const getGroqLLM = (groqApiKey) => {
  return new ChatOpenAI({
    model: "llama3-8b-8192", // Fast and free Groq model
    modelName: "llama3-8b-8192",
    temperature: 0.1,
    apiKey: groqApiKey,
    maxRetries: 0, // Disable retries to rely on our custom rotation
    configuration: {
      baseURL: "https://api.groq.com/openai/v1",
    },
  });
};

async function test() {
  try {
    const llm = getGroqLLM(process.env.GROQ_API_KEY || process.env.GROQ_KEY_1);
    const result = await llm.invoke("respond with exactly one word: 'ok'");
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err);
    if (err.response) {
      console.error(err.response.data);
    }
  }
}

test();
