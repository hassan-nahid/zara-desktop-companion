import { TTSProvider } from "./base.provider.js";

const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

export class ElevenLabsProvider extends TTSProvider {
  constructor(apiKey, voiceId = "") {
    super();
    this.apiKey = apiKey;
    this.voiceId = voiceId;
    this.audio = new Audio();
    this.isCurrentlyPlaying = false;
  }

  async speak(text, options = {}) {
    if (this.isCurrentlyPlaying) {
      this.stop();
    }

    const voiceId = options.voiceId || this.voiceId;
    if (!voiceId || !this.apiKey) {
      throw new Error("ElevenLabs: missing apiKey or voiceId");
    }

    const stability = options.stability ?? 0.5;
    const similarityBoost = options.similarityBoost ?? 0.75;

    const response = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}/with-timestamps`, {
      method: "POST",
      headers: {
        "xi-api-key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style: options.style ?? 0.3,
          use_speaker_boost: options.useSpeakerBoost ?? true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    this.audio.src = audioUrl;
    this.isCurrentlyPlaying = true;

    return new Promise((resolve, reject) => {
      this.audio.onended = () => {
        this.isCurrentlyPlaying = false;
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      this.audio.onerror = (e) => {
        this.isCurrentlyPlaying = false;
        URL.revokeObjectURL(audioUrl);
        reject(new Error("Audio playback error"));
      };

      this.audio.play().catch(reject);
    });
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isCurrentlyPlaying = false;
  }

  isSpeaking() {
    return this.isCurrentlyPlaying;
  }
}