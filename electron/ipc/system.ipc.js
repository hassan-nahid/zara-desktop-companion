import { app, screen } from "electron";
import path from "path";
import { pathToFileURL } from "url";

export const registerSystemIpc = (ipcMain, getMainWindow) => {
  // Dynamic mouse event control - allow click-through on transparent areas
  ipcMain.on("set-ignore-mouse", (event, ignore) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
    }
  });

  // Full click-through toggle
  ipcMain.on("set-click-through", (event, enable) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (enable) {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
      } else {
        mainWindow.setIgnoreMouseEvents(false);
      }
    }
  });

  // Move window position
  ipcMain.on("move-window", (event, { x, y }) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.setPosition(x, y);
    }
  });

  // Get comprehensive screen information
  ipcMain.handle("get-screen-info", () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    const workArea = primaryDisplay.workArea;
    const scaleFactor = primaryDisplay.scaleFactor;

    // Calculate taskbar dimensions
    const taskbarHeight = height - workArea.height - workArea.y;
    const taskbarTop = workArea.y + workArea.height;

    return {
      screenWidth: width,
      screenHeight: height,
      workArea: {
        x: workArea.x,
        y: workArea.y,
        width: workArea.width,
        height: workArea.height,
      },
      taskbar: {
        height: taskbarHeight,
        top: taskbarTop,
        isBottom: taskbarTop > 0,
      },
      scaleFactor,
    };
  });

  // Get taskbar height specifically
  ipcMain.handle("get-taskbar-height", () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { height } = primaryDisplay.size;
    const workArea = primaryDisplay.workArea;
    return height - workArea.height - workArea.y;
  });

  // Resolve model file URL for production
  ipcMain.handle("get-model-url", (event, name) => {
    const basePath = app.getAppPath();
    const filePath = path.join(basePath, "data", "models", name);
    return pathToFileURL(filePath).toString();
  });
};
