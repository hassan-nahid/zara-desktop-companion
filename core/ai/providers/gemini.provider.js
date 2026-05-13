import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./AIProvider.js";
import { buildSystemPrompt } from "../promptBuilder.js";

export class GeminiProvider extends AIProvider {
  constructor(apiKey, modelName = "gemini-2.0-flash") {
    super();
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async chat(messages, context = {}) {
    const contents = messages.map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const result = await this.model.generateContent({
      contents,
      generationConfig: {
        temperature: context.temperature || 0.95,
        maxOutputTokens: context.maxTokens || 500,
      },
    });

    const response = result.response;
    const text = response.text();

    return {
      text,
      ...(await this.detectEmotion(text)),
    };
  }

  async generateResponse(userMessage, conversationHistory, personality, moodContext = {}) {
    const systemPrompt = buildSystemPrompt(personality, moodContext);
    const messages = [
      { role: "user", content: systemPrompt },
      { role: "model", content: `বুঝেছি! আমি ${personality.name || "Zara"}। আমি আমার মেজাজ (${moodContext.mood || "happy"}) অনুযায়ী কথা বলবো। 😊` },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    return this.chat(messages, { temperature: personality.temperature || 0.95 });
  }
}
