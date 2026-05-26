let currentIndex = 0;

export const getGeminiKeysList = () => {
  const keys = [];
  let i = 1;
  while (true) {
    const key = process.env[`GEMINI_KEY_${i}`];
    if (!key) break;
    keys.push(key);
    i++;
  }

  // Fallback to process.env.GEMINI_API_KEY if no numbered keys are found
  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  return keys;
};

export const getNextGeminiKey = () => {
  const keys = getGeminiKeysList();
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found in environment variables (GEMINI_KEY_1, GEMINI_KEY_2, etc., or GEMINI_API_KEY).");
  }
  const key = keys[currentIndex % keys.length];
  const maskedKey = key && key.length > 8 ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : '***';
  console.log(`🔑 Key Rotation: Using Gemini Key ${currentIndex + 1} of ${keys.length} (${maskedKey})`);
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
};