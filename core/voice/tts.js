import { WebSpeechProvider } from "./providers/webspeech.provider.js";
import { ElevenLabsProvider } from "./providers/elevenlabs.provider.js";

export const createTTS = (config) => {
  const { provider = "webspeech", apiKey, voiceId } = config;

  switch (provider) {
    case "webspeech":
      return new WebSpeechProvider();

    case "elevenlabs":
      if (!apiKey) {
        console.warn("ElevenLabs: No API key, falling back to WebSpeech");
        return new WebSpeechProvider();
      }
      return new ElevenLabsProvider(apiKey, voiceId);

    default:
      console.warn(`Unknown TTS provider: ${provider}, using WebSpeech`);
      return new WebSpeechProvider();
  }
};