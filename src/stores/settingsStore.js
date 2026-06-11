import { create } from "zustand";

// Load settings from config file
const loadConfig = () => {
  try {
    return {
      geminiApiKey: "",
    };
  } catch {
    return { geminiApiKey: "" };
  }
};

const DEFAULT_SETTINGS = {
  // AI Settings
  geminiApiKey: import.meta.env.Gemini_API || "",
  modelName: "gemini-2.0-flash",
  temperature: 0.9,

  // Voice Settings
  voiceProvider: "webspeech",
  elevenlabsApiKey: "",
  voiceId: "",
  stability: 0.5,
  similarityBoost: 0.75,

  // Character Settings
  characterName: "Zara",
  emotionDuration: 3000,

  // ===== Mate-Engine Features =====

  // Display Modes
  chibiMode: false,
  bigScreenMode: false,
  sleepMode: false,
  postProcessing: false,

  // Dance
  danceMode: false,
  danceReactivity: 0.5,

  // Auto Reminder (eye exercise)
  reminderEnabled: false,
  reminderInterval: 25, // minutes (20-30)
  reminderPointInterval: 20, // seconds between points
  reminderLastTrigger: 0,

  // Window Sitting
  windowSitting: true,

  // Auto-start
  autoStart: false,

  // Multiple Avatars
  multiAvatarCount: 1,

  // Alarm / Timer (like Mate-Engine)
  alarmEnabled: false,
  alarmTime: null,
};

export const useSettingsStore = create((set) => ({
  ...DEFAULT_SETTINGS,

  // Load API key from settings file
  loadApiKey: () => {
    fetch("/models/settings.json")
      .then((res) => res.json())
      .then((config) => {
        if (config.ai?.geminiApiKey) {
          set({ geminiApiKey: config.ai.geminiApiKey });
        }
      })
      .catch(() => {});
  },

  // Load all settings from localStorage
  loadSettings: () => {
    try {
      const saved = localStorage.getItem("zara-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        set((state) => ({ ...state, ...parsed }));
      }
    } catch {}
  },

  // Save all settings to localStorage
  saveSettings: () => {
    try {
      const state = useSettingsStore.getState();
      const toSave = {
        geminiApiKey: state.geminiApiKey,
        modelName: state.modelName,
        temperature: state.temperature,
        voiceProvider: state.voiceProvider,
        elevenlabsApiKey: state.elevenlabsApiKey,
        voiceId: state.voiceId,
        stability: state.stability,
        similarityBoost: state.similarityBoost,
        chibiMode: state.chibiMode,
        bigScreenMode: state.bigScreenMode,
        sleepMode: state.sleepMode,
        postProcessing: state.postProcessing,
        danceMode: state.danceMode,
        danceReactivity: state.danceReactivity,
        reminderEnabled: state.reminderEnabled,
        reminderInterval: state.reminderInterval,
        reminderPointInterval: state.reminderPointInterval,
        windowSitting: state.windowSitting,
        autoStart: state.autoStart,
        multiAvatarCount: state.multiAvatarCount,
        alarmEnabled: state.alarmEnabled,
        alarmTime: state.alarmTime,
      };
      localStorage.setItem("zara-settings", JSON.stringify(toSave));
    } catch {}
  },

  // AI settings
  setGeminiApiKey: (key) => { set({ geminiApiKey: key }); useSettingsStore.getState().saveSettings(); },
  setModelName: (name) => { set({ modelName: name }); useSettingsStore.getState().saveSettings(); },
  setTemperature: (temp) => { set({ temperature: temp }); useSettingsStore.getState().saveSettings(); },

  // Voice settings
  setVoiceProvider: (provider) => { set({ voiceProvider: provider }); useSettingsStore.getState().saveSettings(); },
  setElevenlabsApiKey: (key) => { set({ elevenlabsApiKey: key }); useSettingsStore.getState().saveSettings(); },
  setVoiceId: (id) => { set({ voiceId: id }); useSettingsStore.getState().saveSettings(); },
  setStability: (value) => { set({ stability: value }); useSettingsStore.getState().saveSettings(); },
  setSimilarityBoost: (value) => { set({ similarityBoost: value }); useSettingsStore.getState().saveSettings(); },

  // Character settings
  setCharacterName: (name) => { set({ characterName: name }); useSettingsStore.getState().saveSettings(); },
  setEmotionDuration: (ms) => { set({ emotionDuration: ms }); useSettingsStore.getState().saveSettings(); },

  // ===== Feature toggles =====

  // Chibi Mode
  setChibiMode: (on) => {
    set({ chibiMode: on });
    useSettingsStore.getState().saveSettings();
    if (on) useSettingsStore.getState().setBigScreenMode(false);
  },

  // Big Screen Mode
  setBigScreenMode: (on) => {
    set({ bigScreenMode: on });
    useSettingsStore.getState().saveSettings();
    if (on) {
      useSettingsStore.getState().setChibiMode(false);
    }
  },

  // Sleep Mode
  setSleepMode: (on) => { set({ sleepMode: on }); useSettingsStore.getState().saveSettings(); },

  // Post Processing
  setPostProcessing: (on) => { set({ postProcessing: on }); useSettingsStore.getState().saveSettings(); },

  // Dance Mode
  setDanceMode: (on) => { set({ danceMode: on }); useSettingsStore.getState().saveSettings(); },
  setDanceReactivity: (val) => { set({ danceReactivity: val }); useSettingsStore.getState().saveSettings(); },

  // Auto Reminder
  setReminderEnabled: (on) => { set({ reminderEnabled: on }); useSettingsStore.getState().saveSettings(); },
  setReminderInterval: (min) => { set({ reminderInterval: min }); useSettingsStore.getState().saveSettings(); },
  setReminderPointInterval: (sec) => { set({ reminderPointInterval: sec }); useSettingsStore.getState().saveSettings(); },

  // Window Sitting
  setWindowSitting: (on) => { set({ windowSitting: on }); useSettingsStore.getState().saveSettings(); },

  // Auto Start
  setAutoStart: (on) => {
    set({ autoStart: on });
    useSettingsStore.getState().saveSettings();
    if (window.electronAPI?.setAutoStart) {
      window.electronAPI.setAutoStart(on);
    }
  },

  // Multi Avatar
  setMultiAvatarCount: (n) => { set({ multiAvatarCount: n }); useSettingsStore.getState().saveSettings(); },

  // Alarm
  setAlarmEnabled: (on) => { set({ alarmEnabled: on }); useSettingsStore.getState().saveSettings(); },
  setAlarmTime: (t) => { set({ alarmTime: t }); useSettingsStore.getState().saveSettings(); },
}));
