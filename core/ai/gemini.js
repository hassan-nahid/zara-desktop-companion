import { GeminiProvider } from "./providers/gemini.provider.js";

export const createGeminiClient = (apiKey, modelName) => {
  return new GeminiProvider(apiKey, modelName);
};
