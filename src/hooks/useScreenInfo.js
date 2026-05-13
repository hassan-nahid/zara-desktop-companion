import { useState, useEffect, useCallback } from "react";

const DEFAULT_SCREEN = {
  screenWidth: 1920,
  screenHeight: 1080,
  workArea: { x: 0, y: 0, width: 1920, height: 1040 },
  taskbar: { height: 40, top: 1040, isBottom: true },
  scaleFactor: 1,
};

export const useScreenInfo = () => {
  const [screenInfo, setScreenInfo] = useState(DEFAULT_SCREEN);

  const fetchScreenInfo = useCallback(async () => {
    if (window.electronAPI?.getScreenInfo) {
      try {
        const info = await window.electronAPI.getScreenInfo();
        setScreenInfo(info);
      } catch (err) {
        console.warn("Failed to get screen info:", err);
      }
    } else {
      // Fallback for browser dev
      setScreenInfo({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        workArea: {
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight - 48,
        },
        taskbar: {
          height: 48,
          top: window.innerHeight - 48,
          isBottom: true,
        },
        scaleFactor: window.devicePixelRatio || 1,
      });
    }
  }, []);

  useEffect(() => {
    fetchScreenInfo();

    // Listen for display changes
    const handleResize = () => fetchScreenInfo();
    window.addEventListener("resize", handleResize);

    // Poll periodically in case display setup changes
    const interval = setInterval(fetchScreenInfo, 30000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, [fetchScreenInfo]);

  // Computed values
  const groundY = screenInfo.workArea.y + screenInfo.workArea.height;
  const taskbarY = screenInfo.taskbar.top;
  const screenWidth = screenInfo.screenWidth;
  const screenHeight = screenInfo.screenHeight;

  return {
    screenInfo,
    groundY,
    taskbarY,
    screenWidth,
    screenHeight,
    taskbarHeight: screenInfo.taskbar.height,
    refreshScreenInfo: fetchScreenInfo,
  };
};
