import { create } from "zustand";

// Character sprite states
export const SPRITE_STATES = {
  IDLE: "idle",
  WALK: "walk",
  SIT: "sit",
  HAPPY: "happy",
  ANGRY: "angry",
  SAD: "sad",
  SHY: "shy",
  LOVE: "love",
};

// Emotion to sprite mapping
export const EMOTION_SPRITES = {
  neutral: SPRITE_STATES.IDLE,
  happy: SPRITE_STATES.HAPPY,
  angry: SPRITE_STATES.ANGRY,
  sad: SPRITE_STATES.SAD,
  shy: SPRITE_STATES.SHY,
  surprised: SPRITE_STATES.HAPPY,
  excited: SPRITE_STATES.HAPPY,
  love: SPRITE_STATES.LOVE,
};

// Behavior states for the state machine
export const BEHAVIORS = {
  IDLE: "idle",
  WALKING: "walking",
  SITTING: "sitting",
  ANGRY_AWAY: "angry_away",
  FIGHTING: "fighting",
};

export const useCharacterStore = create((set, get) => ({
  // Position on screen (pixels)
  x: 400,
  y: 0, // will be set to ground level on mount
  
  // Character dimensions
  width: 220,
  height: 320,

  // Movement
  isWalking: false,
  walkDirection: 1, // 1 = right, -1 = left
  walkSpeed: 1.5,
  walkTarget: null,

  // Current visual state
  currentSprite: SPRITE_STATES.IDLE,
  currentEmotion: "neutral",
  facingRight: true,

  // Behavior state machine
  currentBehavior: BEHAVIORS.IDLE,
  behaviorTimer: null,

  // Sitting state
  isSitting: false,
  sitTarget: null,

  // Animation
  walkFrame: 0, // alternates between 0 and 1 for walk animation
  animationSpeed: 200, // ms between walk frames

  // Interaction
  isBeingDragged: false,
  isBeingPetted: false,
  isPoked: false,

  // Actions
  setPosition: (x, y) => set({ x, y }),
  setX: (x) => set({ x }),
  setY: (y) => set({ y }),

  setWalking: (isWalking, direction) => {
    set({
      isWalking,
      walkDirection: direction !== undefined ? direction : get().walkDirection,
      currentSprite: isWalking ? SPRITE_STATES.WALK : SPRITE_STATES.IDLE,
      facingRight: direction !== undefined ? direction > 0 : get().facingRight,
    });
  },

  setWalkTarget: (target) => set({ walkTarget: target }),

  setSitting: (isSitting) => {
    set({
      isSitting,
      isWalking: false,
      currentSprite: isSitting ? SPRITE_STATES.SIT : SPRITE_STATES.IDLE,
      currentBehavior: isSitting ? BEHAVIORS.SITTING : BEHAVIORS.IDLE,
    });
  },

  setEmotion: (emotion) => {
    const sprite = EMOTION_SPRITES[emotion] || SPRITE_STATES.IDLE;
    const state = get();
    // Don't override walking/sitting sprites with emotion sprites for transient emotions
    const shouldOverrideSprite = !state.isWalking && !state.isSitting;
    set({
      currentEmotion: emotion,
      currentSprite: shouldOverrideSprite ? sprite : state.currentSprite,
    });
  },

  setSprite: (sprite) => set({ currentSprite: sprite }),

  setBehavior: (behavior) => set({ currentBehavior: behavior }),

  setWalkFrame: (frame) => set({ walkFrame: frame }),

  setDragging: (isDragging) => set({ isBeingDragged: isDragging }),

  setPetted: (isPetted) => set({ isBeingPetted: isPetted }),

  setPoked: (isPoked) => set({ isPoked }),

  setFacing: (right) => set({ facingRight: right }),

  // Reset everything
  resetState: () =>
    set({
      currentEmotion: "neutral",
      currentSprite: SPRITE_STATES.IDLE,
      currentBehavior: BEHAVIORS.IDLE,
      isWalking: false,
      isSitting: false,
      isBeingDragged: false,
      isBeingPetted: false,
    }),
}));