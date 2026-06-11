import { useEffect, useRef, useCallback, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export const useReminderSystem = () => {
  const [reminderActive, setReminderActive] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [points, setPoints] = useState([]);
  const reminderTimerRef = useRef(null);
  const pointTimerRef = useRef(null);

  // Generate random points on screen
  const generatePoints = useCallback(() => {
    const count = 8;
    const newPoints = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const x = 10 + col * 24 + Math.random() * 8;
      const y = 10 + row * 40 + Math.random() * 8;
      newPoints.push({
        id: i,
        x: parseFloat(x.toFixed(1)),
        y: parseFloat(y.toFixed(1)),
        active: false,
      });
    }
    return newPoints;
  }, []);

  // Start the eye exercise
  const startReminder = useCallback(() => {
    const genPoints = generatePoints();
    setPoints(genPoints.map(function(p, i) {
      return { ...p, active: i === 0 };
    }));
    setCurrentPointIndex(0);
    setReminderActive(true);
  }, [generatePoints]);

  // Move to next point every N seconds
  useEffect(function() {
    if (!reminderActive) return;

    pointTimerRef.current = setInterval(function() {
      setCurrentPointIndex(function(prev) {
        var next = prev + 1;
        if (next >= 8) {
          setReminderActive(false);
          return 0;
        }
        setPoints(function(prevPoints) {
          return prevPoints.map(function(p, i) {
            return { ...p, active: i === next };
          });
        });
        return next;
      });
    }, useSettingsStore.getState().reminderPointInterval * 1000);

    return function() { clearInterval(pointTimerRef.current); };
  }, [reminderActive]);

  // Complete early
  const completeReminder = useCallback(function() {
    setReminderActive(false);
    setCurrentPointIndex(0);
    setPoints([]);
    clearInterval(pointTimerRef.current);
  }, []);

  // Main timer: trigger reminder every 20-30 minutes
  useEffect(function() {
    var store = useSettingsStore.getState();
    if (!store.reminderEnabled) return;

    var checkReminder = function() {
      var s = useSettingsStore.getState();
      if (!s.reminderEnabled) return;

      var now = Date.now();
      var intervalMs = s.reminderInterval * 60 * 1000;

      if (now - s.reminderLastTrigger >= intervalMs) {
        useSettingsStore.setState({ reminderLastTrigger: now });
        startReminder();
      }
    };

    reminderTimerRef.current = setInterval(checkReminder, 30000);
    checkReminder();

    return function() { clearInterval(reminderTimerRef.current); };
  }, [startReminder]);

  return {
    reminderActive,
    points,
    currentPointIndex,
    startReminder,
    completeReminder,
  };
};
