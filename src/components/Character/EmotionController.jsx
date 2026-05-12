import { useEffect, useRef, useCallback } from "react";
import { useCharacterStore, EMOTIONS } from "../../stores/characterStore";

const EmotionController = ({ vrm, modelRef }) => {
  const animationRef = useRef(null);
  const currentWeightsRef = useRef({ ...EMOTIONS.neutral });

  const { currentEmotion, emotionWeights, emotionTransitionSpeed } = useCharacterStore();

  // Smoothly interpolate blendshape values
  const lerp = (a, b, t) => a + (b - a) * t;

  const updateBlendshapes = useCallback((targetWeights) => {
    if (!modelRef?.current?.expressionManager) return;

    const model = modelRef.current;
    const currentWeights = currentWeightsRef.current;

    Object.entries(targetWeights).forEach(([name, targetValue]) => {
      const currentValue = currentWeights[name] || 0;
      const newValue = lerp(currentValue, targetValue, emotionTransitionSpeed);
      currentWeights[name] = newValue;

      try {
        model.expressionManager.setValue(name, newValue);
      } catch {}
    });

    model.expressionManager.update();
  }, [emotionTransitionSpeed]);

  // Animation loop for smooth transitions
  useEffect(() => {
    const animate = () => {
      updateBlendshapes(emotionWeights);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateBlendshapes, emotionWeights]);

  // Manual emotion trigger (from outside)
  const triggerEmotion = useCallback((emotion, duration = 3000) => {
    const { setEmotion, resetEmotion } = useCharacterStore.getState();
    setEmotion(emotion);

    if (emotion !== "neutral") {
      setTimeout(() => {
        resetEmotion();
      }, duration);
    }
  }, []);

  return null; // Pure controller, no UI
};

export default EmotionController;