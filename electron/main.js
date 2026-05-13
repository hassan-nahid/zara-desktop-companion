import { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { registerAIIpc } from "./ipc/ai.ipc.js";
import { registerVoiceIpc } from "./ipc/voice.ipc.js";
import { registerSystemIpc } from "./ipc/system.ipc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const workArea = primaryDisplay.workArea;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    fullscreenable: false,
    type: "toolbar",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Enable click-through on transparent areas by default
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Remove menu bar
  mainWindow.setMenu(null);

  // Prevent window from being closed by Alt+F4 etc
  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    // mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

const createTray = () => {
  // Create a simple tray icon
  const iconSize = 16;
  const icon = nativeImage.createEmpty();
  
  // Create a simple colored icon programmatically
  const canvas = Buffer.alloc(iconSize * iconSize * 4);
  for (let i = 0; i < iconSize * iconSize; i++) {
    canvas[i * 4] = 167;     // R (purple)
    canvas[i * 4 + 1] = 139; // G
    canvas[i * 4 + 2] = 250; // B
    canvas[i * 4 + 3] = 255; // A
  }
  const trayIcon = nativeImage.createFromBuffer(canvas, { width: iconSize, height: iconSize });
  
  tray = new Tray(trayIcon);
  tray.setToolTip("Zara - Desktop Companion");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "🎀 Zara",
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Show/Hide",
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      },
    },
    {
      label: "Reset Mood",
      click: () => {
        mainWindow.webContents.send("reset-mood");
      },
    },
    {
      label: "Settings",
      click: () => {
        mainWindow.webContents.send("open-settings");
      },
    },
    { type: "separator" },
    {
      label: "Dev Tools",
      click: () => {
        mainWindow.webContents.openDevTools({ mode: "detach" });
      },
    },
    { type: "separator" },
    {
      label: "Quit Zara",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
  });
};

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerAIIpc(ipcMain);
  registerVoiceIpc(ipcMain);
  registerSystemIpc(ipcMain, () => mainWindow);
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
