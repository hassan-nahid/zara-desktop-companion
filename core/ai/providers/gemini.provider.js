import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./AIProvider.js";

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
        temperature: context.temperature || 0.9,
        maxOutputTokens: context.maxTokens || 2048,
      },
    });

    const response = result.response;
    const text = response.text();

    return {
      text,
      ...(await this.detectEmotion(text)),
    };
  }

  async generateResponse(userMessage, conversationHistory, personality) {
    const systemPrompt = this.buildSystemPrompt(personality);
    const messages = [
      { role: "user", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    return this.chat(messages, { temperature: personality.temperature || 0.9 });
  }

  buildSystemPrompt(personality) {
    return `${personality.system || `You are ${personality.name || "Zara"}, a friendly AI companion.`}

Your traits:
- Personality: ${personality.traits || "warm, caring, playful"}
- Language: Primarily Bangla with some English
- Communication style: ${personality.style || "conversational, casual"}

When expressing emotions in your response, include [EMOTION: emotion_name] tag.
Available emotions: happy, angry, sad, shy, surprised, excited, neutral

Example responses:
- "আমি তোমার সাথে কথা বলতে পেরে খুব খুশি হয়েছি! [EMOTION: happy]"
- "হুম, আমি একটু রাগি মেজাজে আছি আজকে। [EMOTION: angry]"
`;
  }
}