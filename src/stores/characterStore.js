import { create } from "zustand";

export const EMOTIONS = {
  neutral: {
    browInnerUp: 0,
    browOuterDownL: 0,
    browOuterDownR: 0,
    eyeLookUp: 0,
    eyeLookDown: 0,
    eyeLookLeft: 0,
    eyeLookRight: 0,
    eyeSquintL: 0,
    eyeSquintR: 0,
    eyeWideL: 0,
    eyeWideR: 0,
    jawOpen: 0,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0,
    mouthRight: 0,
    mouthSmile: 0,
    mouthFrown: 0,
  },
  happy: {
    browInnerUp: 0.3,
    eyeSquintL: 0.5,
    eyeSquintR: 0.5,
    mouthSmile: 0.8,
    mouthLeft: 0.2,
    mouthRight: 0.2,
  },
  angry: {
    browInnerUp: 0.4,
    browOuterDownL: 0.6,
    browOuterDownR: 0.6,
    eyeSquintL: 0.3,
    eyeSquintR: 0.3,
    mouthFrown: 0.6,
    jawOpen: 0.1,
  },
  sad: {
    browInnerUp: 0.5,
    browOuterDownL: 0.3,
    browOuterDownR: 0.3,
    eyeLookDown: 0.3,
    mouthFrown: 0.7,
    mouthLeft: 0.2,
    mouthRight: 0.2,
  },
  shy: {
    browInnerUp: 0.6,
    eyeWideL: 0.3,
    eyeWideR: 0.3,
    mouthSmile: 0.2,
    mouthPucker: 0.4,
    eyeLookDown: 0.2,
  },
  surprised: {
    browInnerUp: 0.7,
    browOuterDownL: 0.2,
    browOuterDownR: 0.2,
    eyeWideL: 0.6,
    eyeWideR: 0.6,
    jawOpen: 0.4,
  },
  excited: {
    browInnerUp: 0.5,
    eyeWideL: 0.4,
    eyeWideR: 0.4,
    mouthSmile: 0.9,
    eyeSquintL: 0.2,
    eyeSquintR: 0.2,
  },
};

export const useCharacterStore = create((set, get) => ({
  // Model state
  vrm: null,
  isLoaded: false,
  position: { x: 0, y: 0 },

  // Emotion state
  currentEmotion: "neutral",
  emotionWeights: { ...EMOTIONS.neutral },
  emotionTransitionSpeed: 0.1,

  // Animation state
  currentAnimation: "idle",
  isWalking: false,
  walkTarget: null,

  // Actions
  setVRM: (vrm) => set({ vrm, isLoaded: !!vrm }),
  setPosition: (x, y) => set({ position: { x, y } }),

  setEmotion: (emotion) => {
    const weights = EMOTIONS[emotion] || EMOTIONS.neutral;
    set({ currentEmotion: emotion, emotionWeights: { ...EMOTIONS.neutral, ...weights } });
  },

  updateEmotionWeights: (weights) => set((state) => ({
    emotionWeights: { ...state.emotionWeights, ...weights }
  })),

  setAnimation: (animation) => set({ currentAnimation: animation }),
  setWalking: (isWalking) => set({ isWalking }),
  setWalkTarget: (target) => set({ walkTarget: target }),

  resetEmotion: () => set({
    currentEmotion: "neutral",
    emotionWeights: { ...EMOTIONS.neutral }
  }),
}));