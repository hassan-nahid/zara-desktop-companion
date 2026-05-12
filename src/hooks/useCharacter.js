import { useCallback, useRef, useEffect } from "react";
import { useCharacterStore, EMOTIONS } from "../stores/characterStore";

const VRM_URL = "/models/avatar.vrm";

export const useCharacter = () => {
  const {
    vrm,
    isLoaded,
    currentEmotion,
    emotionWeights,
    currentAnimation,
    position,
    setVRM,
    setEmotion,
    resetEmotion,
    setAnimation,
    setPosition,
    setWalking,
  } = useCharacterStore();

  const emotionTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Load VRM model
  const loadVRM = useCallback(async (three, url) => {
    try {
      const { VRMLoaderPlugin } = await import("@pixiv/three-vrm");
      const loader = new three.VRMLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      const model = await new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

      setVRM(model);
      return model;
    } catch (error) {
      console.error("Failed to load VRM:", error);
      return null;
    }
  }, [setVRM]);

  // Apply emotion blendshapes
  const applyEmotion = useCallback((model, weights) => {
    if (!model?.expressionManager) return;

    Object.entries(weights).forEach(([name, value]) => {
      try {
        model.expressionManager.setValue(name, value);
      } catch {
        // Blendshape not available in this model
      }
    });
    model.expressionManager.update();
  }, []);

  // Emotion with auto-reset
  const setEmotionWithTimeout = useCallback((emotion, duration = 3000) => {
    setEmotion(emotion);

    if (emotionTimerRef.current) {
      clearTimeout(emotionTimerRef.current);
    }

    if (emotion !== "neutral") {
      emotionTimerRef.current = setTimeout(() => {
        resetEmotion();
      }, duration);
    }
  }, [setEmotion, resetEmotion]);

  // Character position animation
  const moveTo = useCallback((targetX, targetY, onComplete) => {
    const step = () => {
      const current = useCharacterStore.getState().position;
      const dx = targetX - current.x;
      const dy = targetY - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 2) {
        setPosition(targetX, targetY);
        setWalking(false);
        onComplete?.();
        return;
      }

      const speed = 0.05;
      const newX = current.x + dx * speed;
      const newY = current.y + dy * speed;

      setPosition(newX, newY);
      setWalking(true);
      animationFrameRef.current = requestAnimationFrame(step);
    };

    setWalking(true);
    animationFrameRef.current = requestAnimationFrame(step);
  }, [setPosition, setWalking]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return {
    vrm,
    isLoaded,
    currentEmotion,
    emotionWeights,
    currentAnimation,
    position,
    loadVRM,
    applyEmotion,
    setEmotion: setEmotionWithTimeout,
    resetEmotion,
    setAnimation,
    moveTo,
  };
};