import { create } from "zustand";

const MAX_HISTORY = 50;

export const useConversationStore = create((set, get) => ({
  // Conversation state
  messages: [],
  currentMessage: "",
  isTyping: false,
  isSpeaking: false,
  showBubble: false,
  bubbleTimeout: null,

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

  setCurrentMessage: (message) => {
    // Clear previous bubble timeout
    const state = get();
    if (state.bubbleTimeout) {
      clearTimeout(state.bubbleTimeout);
    }

    // Show bubble and auto-hide after 6 seconds
    const timeout = setTimeout(() => {
      set({ showBubble: false });
    }, 6000);

    set({
      currentMessage: message,
      showBubble: !!message,
      bubbleTimeout: timeout,
    });
  },

  hideBubble: () => {
    const state = get();
    if (state.bubbleTimeout) {
      clearTimeout(state.bubbleTimeout);
    }
    set({ showBubble: false });
  },

  setTyping: (isTyping) => set({ isTyping }),

  setSpeaking: (isSpeaking) => set({ isSpeaking }),

  clearHistory: () => set({ messages: [], currentMessage: "", showBubble: false }),

  getHistory: () => get().messages,
}));