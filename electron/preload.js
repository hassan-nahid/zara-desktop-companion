const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setIgnoreMouse: (ignore) => ipcRenderer.send("set-ignore-mouse", ignore),
  moveWindow: (x, y) => ipcRenderer.send("move-window", { x, y }),
  getModelUrl: (name) => ipcRenderer.invoke("get-model-url", name),
});
