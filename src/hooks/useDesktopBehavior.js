import { useEffect, useRef, useCallback } from "react";
import { useCharacterStore, BEHAVIORS, SPRITE_STATES } from "../stores/characterStore";
import { useRelationshipStore, MOODS } from "../stores/relationshipStore";

const MARGIN = 20;
// How close to bottom of screen to trigger sitting
const SIT_THRESHOLD = 60;

export const useDesktopBehavior = (screenWidth, groundY, taskbarHeight) => {
  const behaviorTimerRef = useRef(null);
  const characterHeight = useCharacterStore((s) => s.height);

  // Set character to idle (standing)
  const setIdle = useCallback(() => {
    const store = useCharacterStore.getState();
    const relStore = useRelationshipStore.getState();

    store.setWalking(false);
    store.setSitting(false);
    store.setBehavior(BEHAVIORS.IDLE);

    // Show angry sprite if mood is angry
    if (relStore.mood === MOODS.ANGRY || relStore.mood === MOODS.FIGHTING) {
      store.setSprite(SPRITE_STATES.ANGRY);
    } else {
      store.setSprite(SPRITE_STATES.IDLE);
    }
  }, []);

  // Set character to sitting (when near taskbar / bottom)
  const setSitting = useCallback(() => {
    const store = useCharacterStore.getState();
    store.setSitting(true);
    store.setBehavior(BEHAVIORS.SITTING);
    // Move down slightly so legs dangle over taskbar
    store.setY(groundY - characterHeight + taskbarHeight * 0.3);
  }, [groundY, taskbarHeight, characterHeight]);

  // Check if character should sit based on Y position
  const checkSitPosition = useCallback(() => {
    const store = useCharacterStore.getState();
    const charBottom = store.y + characterHeight;
    const screenBottom = window.innerHeight;

    // If character is near the bottom (taskbar area), sit
    if (charBottom >= screenBottom - SIT_THRESHOLD) {
      if (!store.isSitting) {
        setSitting();
      }
    } else {
      if (store.isSitting) {
        // Stand back up when dragged away from bottom
        store.setY(store.y);
        setIdle();
      }
    }
  }, [characterHeight, setSitting, setIdle]);

  // Initialize — place character and start idle
  useEffect(() => {
    if (!screenWidth || !groundY) return;

    const store = useCharacterStore.getState();
    // Place at center, on the ground (near taskbar = sitting)
    store.setX(screenWidth / 2 - store.width / 2);
    store.setY(groundY - characterHeight);

    // Start sitting on taskbar by default
    setSitting();

    return () => {
      clearTimeout(behaviorTimerRef.current);
    };
  }, [screenWidth, groundY, characterHeight, setSitting]);

  // Watch for position changes (from dragging) to decide sit/stand
  useEffect(() => {
    const unsubscribe = useCharacterStore.subscribe(
      (state) => ({ y: state.y, isBeingDragged: state.isBeingDragged }),
      (curr, prev) => {
        // When user stops dragging, check position
        if (prev.isBeingDragged && !curr.isBeingDragged) {
          checkSitPosition();
        }
      }
    );
    return () => unsubscribe();
  }, [checkSitPosition]);

  // Mood update timer
  useEffect(() => {
    const interval = setInterval(() => {
      useRelationshipStore.getState().updateTimeBased();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // React to mood changes — update sprite
  useEffect(() => {
    const unsubscribe = useRelationshipStore.subscribe(
      (state) => state.mood,
      (mood) => {
        const store = useCharacterStore.getState();
        if (mood === MOODS.ANGRY || mood === MOODS.FIGHTING) {
          store.setSprite(SPRITE_STATES.ANGRY);
        } else if (!store.isSitting) {
          store.setSprite(SPRITE_STATES.IDLE);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  return { setIdle, setSitting, checkSitPosition };
};
