import { app, BrowserWindow, screen, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { createTray } from "./tray.js";
import { registerAIIpc } from "./ipc/ai.ipc.js";
import { registerVoiceIpc } from "./ipc/voice.ipc.js";
import { registerSystemIpc } from "./ipc/system.ipc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 300,
    height: 500,
    x: width - 350,
    y: height - 550,
    transparent: false,
    frame: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

app.whenReady().then(() => {
  createWindow();
  registerAIIpc(ipcMain);
  registerVoiceIpc(ipcMain);
  registerSystemIpc(ipcMain, () => mainWindow);
  tray = createTray(app, mainWindow);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
