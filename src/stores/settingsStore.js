import { create } from "zustand";

// Load settings from config file
const loadConfig = () => {
  try {
    // This will be loaded via fetch in the app
    return {
      geminiApiKey: "",
    };
  } catch {
    return { geminiApiKey: "" };
  }
};

const DEFAULT_SETTINGS = {
  // AI Settings
  geminiApiKey: import.meta.env.Gemini_API || "",
  modelName: "gemini-2.0-flash",
  temperature: 0.9,

  // Voice Settings
  voiceProvider: "webspeech", // "webspeech" (free) or "elevenlabs"
  elevenlabsApiKey: "",
  voiceId: "",
  stability: 0.5,
  similarityBoost: 0.75,

  // Character Settings
  characterName: "Zara",
  emotionDuration: 3000,
};

export const useSettingsStore = create((set) => ({
  ...DEFAULT_SETTINGS,

  // Load API key from settings file
  loadApiKey: () => {
    fetch("/models/settings.json")
      .then((res) => res.json())
      .then((config) => {
        if (config.ai?.geminiApiKey) {
          set({ geminiApiKey: config.ai.geminiApiKey });
        }
      })
      .catch(() => {
        // Config not found, use default
      });
  },

  // Actions
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setModelName: (name) => set({ modelName: name }),
  setTemperature: (temp) => set({ temperature: temp }),

  setVoiceProvider: (provider) => set({ voiceProvider: provider }),
  setElevenlabsApiKey: (key) => set({ elevenlabsApiKey: key }),
  setVoiceId: (id) => set({ voiceId: id }),
  setStability: (value) => set({ stability: value }),
  setSimilarityBoost: (value) => set({ similarityBoost: value }),

  setCharacterName: (name) => set({ characterName: name }),
  setEmotionDuration: (ms) => set({ emotionDuration: ms }),
}));
