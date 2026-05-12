// Web Speech API - Free STT (built into browser)
export class WebSTTProvider {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;

    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = "bn-BD"; // Bengali by default

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results.map((r) => r[0].transcript).join("");

      this.onResult?.(transcript, event.results[0].isFinal);
    };

    this.recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        this.onError?.(event.error);
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd?.();
    };
  }

  setLanguage(lang = "bn-BD") {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error("STT start error:", e);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}