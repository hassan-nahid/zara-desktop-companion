import { GeminiProvider } from "./providers/gemini.provider.js";

// Emotion keywords mapping
const EMOTION_KEYWORDS = {
  happy: ["খুশি", "খুশি", "সুখি", "আনন্দ", "হ্যাপি", "happy", "joy", "excited", "great", "wonderful"],
  angry: ["রাগ", "গরম", "বিরক্ত", "খারাপ", "angry", "mad", "frustrated", "annoyed"],
  sad: ["দুঃখ", "কষ্ট", "ব্যথা", "মন খারাপ", "sad", "upset", "down", "depressed"],
  shy: ["লজ্জা", "শাই", "shy", "embarrassed", "bashful"],
  surprised: ["অবাক", "হতবাক", "চমৎকার", "surprised", "wow", "amazing"],
  excited: ["উত্তেজিত", "উৎসাহী", "প্রেরণা", "excited", "thrilled", "energetic"],
};

export class EmotionParser {
  constructor() {
    this.emotionKeywords = EMOTION_KEYWORDS;
  }

  // Extract emotion from text using regex [EMOTION: name]
  extractEmotionTag(text) {
    const match = text.match(/\[EMOTION:\s*(\w+)\]/i);
    if (match) {
      const emotion = match[1].toLowerCase();
      const cleanText = text.replace(/\[EMOTION:\s*\w+\]/i, "").trim();
      return { emotion, text: cleanText };
    }
    return { emotion: null, text };
  }

  // Detect emotion from text content
  detectEmotion(text) {
    const lowerText = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return emotion;
        }
      }
    }

    return "neutral";
  }

  // Parse emotion and return clean response
  parse(text) {
    const { emotion: tagEmotion, text: cleanText } = this.extractEmotionTag(text);

    if (tagEmotion) {
      return { emotion: tagEmotion, text: cleanText };
    }

    const detectedEmotion = this.detectEmotion(text);
    return { emotion: detectedEmotion, text };
  }
}

export const createAI = (config) => {
  const { provider = "gemini", apiKey, modelName } = config;

  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey, modelName || "gemini-2.0-flash");
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
};