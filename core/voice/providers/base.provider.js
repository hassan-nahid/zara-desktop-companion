// Base TTS Provider interface
export class TTSProvider {
  async speak(text, options = {}) {
    throw new Error("speak() must be implemented");
  }

  async stop() {
    // Optional: stop current speech
  }

  isSpeaking() {
    return false;
  }
}