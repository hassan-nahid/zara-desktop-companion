const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Mouse/Window control
  setIgnoreMouse: (ignore) => ipcRenderer.send("set-ignore-mouse", ignore),
  setClickThrough: (enable) => ipcRenderer.send("set-click-through", enable),
  moveWindow: (x, y) => ipcRenderer.send("move-window", { x, y }),

  // Screen info
  getScreenInfo: () => ipcRenderer.invoke("get-screen-info"),
  getTaskbarHeight: () => ipcRenderer.invoke("get-taskbar-height"),

  // Model loading
  getModelUrl: (name) => ipcRenderer.invoke("get-model-url", name),

  // Auto-start
  setAutoStart: (enable) => ipcRenderer.send("set-auto-start", enable),
  getAutoStart: () => ipcRenderer.invoke("get-auto-start"),

  // Events from main process
  onResetMood: (callback) => ipcRenderer.on("reset-mood", callback),
  onOpenSettings: (callback) => ipcRenderer.on("open-settings", callback),
  onToggleChibi: (callback) => ipcRenderer.on("toggle-chibi", (_, val) => callback(val)),
  onToggleDance: (callback) => ipcRenderer.on("toggle-dance", (_, val) => callback(val)),
  onToggleSleep: (callback) => ipcRenderer.on("toggle-sleep", (_, val) => callback(val)),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
