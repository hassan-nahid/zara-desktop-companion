import { useCallback, useRef } from "react";
import { useConversationStore } from "../stores/conversationStore";
import { useCharacterStore, SPRITE_STATES } from "../stores/characterStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useRelationshipStore } from "../stores/relationshipStore";
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
    characterName,
  } = useConversationStore();

  const { setEmotion, setSprite } = useCharacterStore();
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
    const relStore = useRelationshipStore.getState();
    const parser = emotionParserRef.current;

    // Record interaction
    relStore.recordInteraction();

    // Check if message is rude or sweet and update relationship
    if (parser.isRudeMessage(userMessage)) {
      relStore.processRudeMessage();
    } else if (parser.isSweetMessage(userMessage)) {
      relStore.processSweetMessage();
    }

    addMessage("user", userMessage);
    setTyping(true);

    const provider = initProvider();
    if (!provider) {
      setTyping(false);
      setCurrentMessage("API key দাও আগে! ⚙️ Settings এ যাও~");
      return;
    }

    try {
      // Get current mood context for prompt
      const moodContext = {
        mood: relStore.mood,
        loveMeter: relStore.loveMeter,
        angerMeter: relStore.angerMeter,
        ignoreMinutes: relStore.ignoreMinutes,
      };

      const personality = {
        ...DEFAULT_PERSONALITY,
        name: characterName || settingsName,
        temperature,
      };

      const history = buildConversationContext(messages, 10);
      const response = await provider.generateResponse(
        userMessage,
        history,
        personality,
        moodContext
      );

      // Parse emotion and actions from response
      const { emotion, actions, text } = parser.parse(response.text);

      addMessage("model", text);
      setCurrentMessage(text);
      setTyping(false);

      // Apply emotion
      if (emotion) {
        setEmotion(emotion);
      }

      // Apply actions
      if (actions && actions.length > 0) {
        for (const action of actions) {
          switch (action) {
            case "turn_away":
              setSprite(SPRITE_STATES.ANGRY);
              useCharacterStore.getState().setFacing(false);
              break;
            case "come_closer":
              setSprite(SPRITE_STATES.LOVE);
              break;
            case "walk_away":
              // This will be handled by the behavior system
              setSprite(SPRITE_STATES.ANGRY);
              break;
            case "bounce":
              setSprite(SPRITE_STATES.HAPPY);
              break;
          }
        }
      }

      return { text, emotion, actions };
    } catch (error) {
      console.error("AI Error:", error);
      setTyping(false);
      setCurrentMessage("উফ, কিছু একটা ভুল হয়ে গেছে... 😅");
      return { error: error.message };
    }
  }, [messages, characterName, settingsName, temperature, initProvider, addMessage, setCurrentMessage, setTyping, setEmotion, setSprite]);

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