import { create } from "zustand";

// Relationship moods
export const MOODS = {
  LOVE: "love",
  HAPPY: "happy",
  NEUTRAL: "neutral",
  IRRITATED: "irritated",
  ANGRY: "angry",
  FIGHTING: "fighting",
  FORGIVING: "forgiving",
};

// Mood effects on behavior
export const MOOD_BEHAVIORS = {
  [MOODS.LOVE]: {
    chatStyle: "sweet",
    initiatesChat: true,
    followsMouse: true,
    turnsAway: false,
  },
  [MOODS.HAPPY]: {
    chatStyle: "friendly",
    initiatesChat: true,
    followsMouse: false,
    turnsAway: false,
  },
  [MOODS.NEUTRAL]: {
    chatStyle: "normal",
    initiatesChat: true,
    followsMouse: false,
    turnsAway: false,
  },
  [MOODS.IRRITATED]: {
    chatStyle: "short",
    initiatesChat: false,
    followsMouse: false,
    turnsAway: false,
  },
  [MOODS.ANGRY]: {
    chatStyle: "cold",
    initiatesChat: false,
    followsMouse: false,
    turnsAway: true,
  },
  [MOODS.FIGHTING]: {
    chatStyle: "silent",
    initiatesChat: false,
    followsMouse: false,
    turnsAway: true,
  },
  [MOODS.FORGIVING]: {
    chatStyle: "hesitant",
    initiatesChat: false,
    followsMouse: false,
    turnsAway: false,
  },
};

export const useRelationshipStore = create((set, get) => ({
  // Core meters
  mood: MOODS.HAPPY,
  loveMeter: 70, // 0-100
  angerMeter: 0, // 0-100
  
  // Timing
  lastInteractionTime: Date.now(),
  lastAutoTalkTime: Date.now(),
  ignoreMinutes: 0,

  // Fight state
  fightReason: null,
  fightStartTime: null,
  
  // History
  moodHistory: [],

  // Get current mood behavior
  getMoodBehavior: () => MOOD_BEHAVIORS[get().mood] || MOOD_BEHAVIORS[MOODS.NEUTRAL],

  // Record interaction
  recordInteraction: () => {
    const state = get();
    const now = Date.now();
    
    set({
      lastInteractionTime: now,
      ignoreMinutes: 0,
    });

    // Sweet interaction reduces anger
    if (state.angerMeter > 0) {
      set({ angerMeter: Math.max(0, state.angerMeter - 10) });
    }

    // Increase love on interaction
    if (state.loveMeter < 100) {
      set({ loveMeter: Math.min(100, state.loveMeter + 2) });
    }

    // If fighting/angry and user talks, start forgiving
    if (state.mood === MOODS.FIGHTING || state.mood === MOODS.ANGRY) {
      set({ mood: MOODS.FORGIVING });
    }
  },

  // Process sweet message from user
  processSweetMessage: () => {
    const state = get();
    const newLove = Math.min(100, state.loveMeter + 15);
    const newAnger = Math.max(0, state.angerMeter - 20);
    
    let newMood = state.mood;
    if (state.mood === MOODS.FORGIVING || state.mood === MOODS.IRRITATED) {
      newMood = MOODS.HAPPY;
    }
    if (newLove > 80) {
      newMood = MOODS.LOVE;
    }

    set({
      loveMeter: newLove,
      angerMeter: newAnger,
      mood: newMood,
    });
  },

  // Process rude message from user
  processRudeMessage: () => {
    const state = get();
    const newAnger = Math.min(100, state.angerMeter + 25);
    const newLove = Math.max(0, state.loveMeter - 10);

    let newMood = state.mood;
    if (newAnger >= 70) {
      newMood = MOODS.FIGHTING;
    } else if (newAnger >= 40) {
      newMood = MOODS.ANGRY;
    } else if (newAnger >= 20) {
      newMood = MOODS.IRRITATED;
    }

    set({
      angerMeter: newAnger,
      loveMeter: newLove,
      mood: newMood,
      fightReason: newMood === MOODS.FIGHTING ? "rude_message" : state.fightReason,
      fightStartTime: newMood === MOODS.FIGHTING ? Date.now() : state.fightStartTime,
    });
  },

  // Update based on time (called periodically)
  updateTimeBased: () => {
    const state = get();
    const now = Date.now();
    const minutesSinceInteraction = (now - state.lastInteractionTime) / 60000;

    set({ ignoreMinutes: minutesSinceInteraction });

    // If ignored too long, get irritated
    if (minutesSinceInteraction > 10 && state.mood === MOODS.HAPPY) {
      set({ mood: MOODS.IRRITATED });
    }
    if (minutesSinceInteraction > 20 && state.mood === MOODS.IRRITATED) {
      set({ mood: MOODS.ANGRY, angerMeter: Math.min(100, state.angerMeter + 5) });
    }

    // Natural anger decay
    if (state.angerMeter > 0 && state.mood !== MOODS.FIGHTING) {
      set({ angerMeter: Math.max(0, state.angerMeter - 1) });
    }

    // Fighting auto-resolves after 5 minutes
    if (state.mood === MOODS.FIGHTING && state.fightStartTime) {
      const fightMinutes = (now - state.fightStartTime) / 60000;
      if (fightMinutes > 5) {
        set({
          mood: MOODS.FORGIVING,
          angerMeter: Math.max(0, state.angerMeter - 20),
        });
      }
    }

    // Forgiving → Happy after some time
    if (state.mood === MOODS.FORGIVING) {
      if (state.angerMeter < 10) {
        set({ mood: MOODS.HAPPY });
      }
    }

    // Anger thresholds
    if (state.angerMeter < 10 && (state.mood === MOODS.ANGRY || state.mood === MOODS.IRRITATED)) {
      set({ mood: MOODS.HAPPY });
    }
  },

  // Head pat increases love
  processHeadPat: () => {
    const state = get();
    const newLove = Math.min(100, state.loveMeter + 5);
    const newAnger = Math.max(0, state.angerMeter - 5);
    
    let newMood = state.mood;
    if (state.mood === MOODS.IRRITATED) {
      newMood = MOODS.HAPPY;
    }
    if (state.mood === MOODS.FORGIVING) {
      newMood = MOODS.HAPPY;
    }
    if (newLove > 85) {
      newMood = MOODS.LOVE;
    }

    set({
      loveMeter: newLove,
      angerMeter: newAnger,
      mood: newMood,
    });
  },

  // Reset mood
  resetMood: () =>
    set({
      mood: MOODS.HAPPY,
      loveMeter: 70,
      angerMeter: 0,
      ignoreMinutes: 0,
      fightReason: null,
      fightStartTime: null,
      lastInteractionTime: Date.now(),
    }),

  // Set mood directly
  setMood: (mood) => set({ mood }),
}));
