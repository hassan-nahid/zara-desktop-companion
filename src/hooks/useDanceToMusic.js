import { useEffect, useRef, useCallback, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { useCharacterStore, SPRITE_STATES } from "../stores/characterStore";

export const useDanceToMusic = () => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isDancing, setIsDancing] = useState(false);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const danceBeatRef = useRef(0);

  // Start listening to microphone for music reactivity
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      sourceRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume across all frequencies
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = avg / 255;

        setAudioLevel(normalized);
        setIsDancing(normalized > 0.08);

        animFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err) {
      console.log("Microphone access failed:", err);
      // Try system audio loopback as fallback (limited browser support)
      setIsDancing(false);
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setIsDancing(false);
  }, []);

  // Dance beat timing
  const getDanceBeat = useCallback(() => {
    return danceBeatRef.current;
  }, []);

  // Update character sprite based on dance state
  useEffect(() => {
    if (isDancing) {
      const store = useCharacterStore.getState();
      store.setSprite(SPRITE_STATES.HAPPY);
      store.setWalking(true, 1);
    } else {
      const store = useCharacterStore.getState();
      store.setWalking(false);
      store.setSprite(SPRITE_STATES.IDLE);
    }
  }, [isDancing]);

  // Watch dance mode setting
  useEffect(() => {
    const unsubscribe = useSettingsStore.subscribe(
      (state) => state.danceMode,
      (danceMode) => {
        if (danceMode) {
          startListening();
        } else {
          stopListening();
        }
      }
    );

    return () => {
      unsubscribe();
      stopListening();
    };
  }, [startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return {
    audioLevel,
    isDancing,
    startListening,
    stopListening,
  };
};
