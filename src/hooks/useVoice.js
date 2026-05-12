import { useCallback, useRef, useState, useEffect } from "react";
import { useConversationStore } from "../stores/conversationStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useCharacterStore } from "../stores/characterStore";
import { createTTS } from "../../core/voice/tts.js";
import { WebSTTProvider } from "../../core/voice/stt.js";

export const useVoice = () => {
  const ttsRef = useRef(null);
  const sttRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const { setSpeaking, setCurrentMessage } = useConversationStore();
  const { stability, similarityBoost, voiceId: settingsVoiceId } = useSettingsStore();
  const { setEmotion } = useCharacterStore();

  // Initialize TTS
  useEffect(() => {
    const settings = useSettingsStore.getState();
    ttsRef.current = createTTS({
      provider: settings.voiceProvider || "webspeech",
      apiKey: settings.elevenlabsApiKey,
      voiceId: settings.voiceId,
    });

    // Get available voices for WebSpeech
    if (ttsRef.current.getVoices) {
      ttsRef.current.getVoices().then(setAvailableVoices);
    }
  }, []);

  // Initialize STT
  useEffect(() => {
    sttRef.current = new WebSTTProvider();

    sttRef.current.onStart = () => setIsListening(true);
    sttRef.current.onEnd = () => setIsListening(false);

    sttRef.current.onResult = (transcript, isFinal) => {
      if (isFinal) {
        // Handle final transcript - this should trigger AI response
        window.dispatchEvent(
          new CustomEvent("voice-input", { detail: { text: transcript } })
        );
      }
    };

    sttRef.current.onError = (error) => {
      console.error("STT Error:", error);
      setIsListening(false);
    };

    return () => {
      sttRef.current?.stop();
    };
  }, []);

  // Speak text
  const speak = useCallback(async (text, options = {}) => {
    if (!ttsRef.current) return;

    try {
      setSpeaking(true);

      await ttsRef.current.speak(text, {
        stability,
        similarityBoost,
        voiceId: settingsVoiceId,
        ...options,
      });

      setSpeaking(false);
    } catch (error) {
      console.error("TTS Error:", error);
      setSpeaking(false);
    }
  }, [stability, similarityBoost, settingsVoiceId, setSpeaking]);

  // Start listening
  const startListening = useCallback((language = "bn-BD") => {
    if (sttRef.current?.isSupported()) {
      sttRef.current.setLanguage(language);
      sttRef.current.start();

      // Trigger listening emotion
      setEmotion("curious", 5000);
    }
  }, [setEmotion]);

  // Stop listening
  const stopListening = useCallback(() => {
    sttRef.current?.stop();
    setIsListening(false);
  }, []);

  // Check if speaking
  const isSpeaking = useCallback(() => {
    return ttsRef.current?.isSpeaking() || false;
  }, []);

  return {
    speak,
    startListening,
    stopListening,
    isListening,
    isSpeaking,
    availableVoices,
  };
};