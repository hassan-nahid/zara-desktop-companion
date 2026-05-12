import { app } from "electron";
import path from "path";
import { pathToFileURL } from "url";

export const registerSystemIpc = (ipcMain, getMainWindow) => {
  ipcMain.on("set-ignore-mouse", (event, ignore) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
    }
  });

  ipcMain.on("move-window", (event, { x, y }) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.setPosition(x, y);
    }
  });

  ipcMain.handle("get-model-url", (event, name) => {
    const basePath = app.getAppPath();
    const filePath = path.join(basePath, "data", "models", name);
    return pathToFileURL(filePath).toString();
  });
};
