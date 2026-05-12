// Base AI Provider interface - all providers must implement this
export class AIProvider {
  async chat(messages, context) {
    throw new Error("chat() must be implemented by provider");
  }

  async detectEmotion(text) {
    // Emotion detection regex: [EMOTION: emotion_name]
    const match = text.match(/\[EMOTION:\s*(\w+)\]/i);
    if (match) {
      const emotion = match[1].toLowerCase();
      const cleanText = text.replace(/\[EMOTION:\s*\w+\]/i, "").trim();
      return { emotion, text: cleanText };
    }
    return { emotion: null, text };
  }

  async generateResponse(userMessage, conversationHistory, personality) {
    throw new Error("generateResponse() must be implemented by provider");
  }
}
