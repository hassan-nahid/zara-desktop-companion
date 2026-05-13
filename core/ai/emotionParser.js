import { GeminiProvider } from "./providers/gemini.provider.js";

// Emotion keywords mapping
const EMOTION_KEYWORDS = {
  happy: [
    "খুশি", "সুখি", "আনন্দ", "হ্যাপি", "মজা", "ভালো লাগছে",
    "happy", "joy", "excited", "great", "wonderful", "haha", "হাহা",
  ],
  angry: [
    "রাগ", "গরম", "বিরক্ত", "খারাপ", "চুপ কর", "বলবো না",
    "angry", "mad", "frustrated", "annoyed", "হুম",
  ],
  sad: [
    "দুঃখ", "কষ্ট", "ব্যথা", "মন খারাপ", "কান্না", "একা",
    "sad", "upset", "down", "depressed", "cry", "lonely",
  ],
  shy: [
    "লজ্জা", "শাই", "ব্লাশ", "shy", "embarrassed", "bashful", "blush",
  ],
  surprised: [
    "অবাক", "হতবাক", "চমৎকার", "সত্যি?", "কী!",
    "surprised", "wow", "amazing", "really",
  ],
  love: [
    "ভালোবাসা", "ভালোবাসি", "পছন্দ", "প্রিয়", "love", "adore",
    "miss you", "মিস", "love you", "💕", "💖", "❤️",
  ],
};

// Action keywords
const ACTION_KEYWORDS = {
  turn_away: ["turn_away", "মুখ ঘুরাও", "away"],
  come_closer: ["come_closer", "কাছে আসো"],
  walk_away: ["walk_away", "চলে যাও"],
  bounce: ["bounce", "লাফাও"],
};

// Rude word detection for relationship system
const RUDE_WORDS = [
  "বোকা", "চুপ", "থাম", "বিরক্ত", "যাও", "হারা", "পাগল", "বদ",
  "shut up", "stupid", "dumb", "ugly", "hate", "go away", "leave",
  "annoy", "চুপ কর", "কথা বলবি না", "বাজে",
];

const SWEET_WORDS = [
  "ভালোবাসি", "সুন্দর", "কিউট", "প্রিয়", "সোনা", "মিস করি",
  "sorry", "love", "beautiful", "cute", "miss", "precious",
  "ধন্যবাদ", "thank", "love you", "I'm sorry", "মাফ কর",
];

export class EmotionParser {
  constructor() {
    this.emotionKeywords = EMOTION_KEYWORDS;
  }

  // Extract emotion tag from AI response [EMOTION: name]
  extractEmotionTag(text) {
    const match = text.match(/\[EMOTION:\s*(\w+)\]/i);
    if (match) {
      const emotion = match[1].toLowerCase();
      const cleanText = text.replace(/\[EMOTION:\s*\w+\]/gi, "").trim();
      return { emotion, text: cleanText };
    }
    return { emotion: null, text };
  }

  // Extract action tags from AI response [ACTION: name]
  extractActionTags(text) {
    const actions = [];
    const actionRegex = /\[ACTION:\s*(\w+)\]/gi;
    let match;

    while ((match = actionRegex.exec(text)) !== null) {
      actions.push(match[1].toLowerCase());
    }

    const cleanText = text.replace(/\[ACTION:\s*\w+\]/gi, "").trim();
    return { actions, text: cleanText };
  }

  // Detect emotion from text content (fallback)
  detectEmotion(text) {
    const lowerText = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return emotion;
        }
      }
    }

    return "neutral";
  }

  // Detect if user message is rude
  isRudeMessage(text) {
    const lowerText = text.toLowerCase();
    return RUDE_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
  }

  // Detect if user message is sweet
  isSweetMessage(text) {
    const lowerText = text.toLowerCase();
    return SWEET_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
  }

  // Full parse: emotion + actions + clean text
  parse(text) {
    // First extract emotion tag
    const { emotion: tagEmotion, text: afterEmotionText } = this.extractEmotionTag(text);

    // Then extract action tags
    const { actions, text: cleanText } = this.extractActionTags(afterEmotionText);

    // Fallback emotion detection
    const emotion = tagEmotion || this.detectEmotion(cleanText);

    return {
      emotion,
      actions,
      text: cleanText,
    };
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
