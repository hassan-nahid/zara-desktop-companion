import { create } from "zustand";

const DEFAULT_SETTINGS = {
  // AI Settings
  geminiApiKey: "",
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