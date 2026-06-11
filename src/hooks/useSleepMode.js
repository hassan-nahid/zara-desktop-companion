import { useEffect, useRef } from "react";
import { useCharacterStore } from "../stores/characterStore";
import { useRelationshipStore, MOODS } from "../stores/relationshipStore";
import { useSettingsStore } from "../stores/settingsStore";

export const useSleepMode = () => {
  const sleepTimerRef = useRef(null);
  const wakeTimerRef = useRef(null);

  useEffect(() => {
    const checkSleep = () => {
      const relStore = useRelationshipStore.getState();
      const settings = useSettingsStore.getState();
      const charStore = useCharacterStore.getState();

      if (!settings.sleepMode) return;
      if (charStore.isBeingDragged) return;
      if (relStore.mood === MOODS.FIGHTING || relStore.mood === MOODS.ANGRY) return;

      const minutesSinceInteraction = relStore.ignoreMinutes;

      // Fall asleep after 5 minutes of inactivity (when sleep mode is on)
      if (minutesSinceInteraction >= 5 && !charStore.isSitting) {
        charStore.setSitting(true);
      }
    };

    const checkWake = () => {
      const relStore = useRelationshipStore.getState();
      const charStore = useCharacterStore.getState();
      const settings = useSettingsStore.getState();

      if (!settings.sleepMode) return;

      const minutesSinceInteraction = relStore.ignoreMinutes;

      // Wake up on interaction
      if (minutesSinceInteraction < 1 && charStore.isSitting) {
        charStore.setSitting(false);
      }
    };

    sleepTimerRef.current = setInterval(checkSleep, 60000);
    wakeTimerRef.current = setInterval(checkWake, 15000);

    return () => {
      clearInterval(sleepTimerRef.current);
      clearInterval(wakeTimerRef.current);
    };
  }, []);
};
