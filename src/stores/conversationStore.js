import { create } from "zustand";

const MAX_HISTORY = 50;

export const useConversationStore = create((set, get) => ({
  // Conversation state
  messages: [],
  currentMessage: "",
  isTyping: false,
  isSpeaking: false,

  // Character info
  characterName: "Zara",

  // Actions
  addMessage: (role, content) => {
    set((state) => ({
      messages: [
        ...state.messages.slice(-MAX_HISTORY + 1),
        { role, content, timestamp: Date.now() },
      ],
    }));
  },

  setCurrentMessage: (message) => set({ currentMessage: message }),

  setTyping: (isTyping) => set({ isTyping }),

  setSpeaking: (isSpeaking) => set({ isSpeaking }),

  clearHistory: () => set({ messages: [], currentMessage: "" }),

  getHistory: () => get().messages,
}));