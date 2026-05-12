import { useCallback, useRef } from "react";
import { useConversationStore } from "../stores/conversationStore";
import { useCharacterStore } from "../stores/characterStore";
import { useSettingsStore } from "../stores/settingsStore";
import { createAI, EmotionParser } from "../../core/ai/emotionParser.js";
import { buildSystemPrompt, buildConversationContext, DEFAULT_PERSONALITY } from "../../core/ai/promptBuilder.js";

export const useAI = () => {
  const providerRef = useRef(null);
  const emotionParserRef = useRef(new EmotionParser());

  const {
    messages,
    addMessage,
    setCurrentMessage,
    setTyping,
    setSpeaking,
    characterName,
  } = useConversationStore();

  const { setEmotion } = useCharacterStore();
  const { geminiApiKey, modelName, temperature, characterName: settingsName } = useSettingsStore();

  // Initialize provider
  const initProvider = useCallback(() => {
    if (providerRef.current) return providerRef.current;

    if (!geminiApiKey) {
      console.warn("Gemini API key not set");
      return null;
    }

    providerRef.current = createAI({
      provider: "gemini",
      apiKey: geminiApiKey,
      modelName,
    });

    return providerRef.current;
  }, [geminiApiKey, modelName]);

  // Send message and get response
  const sendMessage = useCallback(async (userMessage) => {
    addMessage("user", userMessage);
    setTyping(true);

    const provider = initProvider();
    if (!provider) {
      setTyping(false);
      setCurrentMessage("API key not configured");
      return;
    }

    try {
      const personality = {
        ...DEFAULT_PERSONALITY,
        name: characterName || settingsName,
        temperature,
      };

      const history = buildConversationContext(messages, 10);
      const response = await provider.generateResponse(
        userMessage,
        history,
        personality
      );

      // Parse emotion from response
      const { emotion, text } = emotionParserRef.current.parse(response.text);

      addMessage("model", text);
      setCurrentMessage(text);
      setTyping(false);

      // Trigger emotion
      if (emotion) {
        setEmotion(emotion);
      }

      return { text, emotion };
    } catch (error) {
      console.error("AI Error:", error);
      setTyping(false);
      setCurrentMessage("Error: Could not get response");
      return { error: error.message };
    }
  }, [messages, characterName, settingsName, temperature, initProvider, addMessage, setCurrentMessage, setTyping, setEmotion]);

  // Reset conversation
  const reset = useCallback(() => {
    useConversationStore.getState().clearHistory();
    providerRef.current = null;
  }, []);

  return {
    sendMessage,
    reset,
    initProvider,
  };
};