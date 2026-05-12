import { TTSProvider } from "./base.provider.js";

// Web Speech API TTS - Free, built into browser
export class WebSpeechProvider extends TTSProvider {
  constructor() {
    super();
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.onStart = null;
    this.onEnd = null;
  }

  getVoices() {
    return new Promise((resolve) => {
      let voices = this.synth.getVoices();

      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Chrome loads voices async
      this.synth.onvoiceschanged = () => {
        voices = this.synth.getVoices();
        resolve(voices);
      };

      // Timeout fallback
      setTimeout(() => resolve(voices), 1000);
    });
  }

  async speak(text, options = {}) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Voice selection
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to find a good Bengali/English voice
      const voices = await this.getVoices();
      const preferred = voices.find((v) =>
        v.lang.startsWith("bn") || v.lang.startsWith("en")
      );
      if (preferred) utterance.voice = preferred;
    }

    // Settings
    utterance.rate = options.rate || 0.9;  // Slightly slower
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Language
    if (options.lang) {
      utterance.lang = options.lang;
    }

    return new Promise((resolve, reject) => {
      utterance.onstart = () => {
        this.currentUtterance = utterance;
        this.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        reject(e);
      };

      this.synth.speak(utterance);
    });
  }

  stop() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  isSpeaking() {
    return this.synth.speaking;
  }
}