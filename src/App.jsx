import { useEffect, useState } from "react";
import VRMCharacter from "./components/Character/VRMCharacter";
import ChatBubble from "./components/ChatBubble/ChatBubble";
import EmotionIndicator from "./components/UI/EmotionIndicator";
import SettingsPanel from "./components/UI/SettingsPanel";
import { useCharacterStore } from "./stores/characterStore";
import { useRelationshipStore } from "./stores/relationshipStore";
import { useConversationStore } from "./stores/conversationStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useScreenInfo } from "./hooks/useScreenInfo";
import { useDesktopBehavior } from "./hooks/useDesktopBehavior";
import { useAutoTalk } from "./hooks/useAutoTalk";
import { useAI } from "./hooks/useAI";

const App = () => {
  const [showSettings, setShowSettings] = useState(false);

  const { geminiApiKey, loadApiKey } = useSettingsStore();
  const { initProvider } = useAI();
  const { screenWidth, groundY, taskbarHeight } = useScreenInfo();

  // Initialize desktop behavior (idle, sitting)
  useDesktopBehavior(screenWidth, groundY, taskbarHeight);

  // Initialize auto-talk
  useAutoTalk();

  // Load API key on mount
  useEffect(() => { loadApiKey(); }, []);

  // Initialize AI when API key is available
  useEffect(() => {
    if (geminiApiKey) initProvider();
  }, [geminiApiKey]);

  // Listen for tray menu events
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onResetMood(() => {
        useRelationshipStore.getState().resetMood();
        useCharacterStore.getState().resetState();
        useConversationStore.getState().setCurrentMessage("আবার শুরু! 💕 সব ভুলে গেছি!");
      });
      window.electronAPI.onOpenSettings(() => setShowSettings(true));
    }
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners("reset-mood");
        window.electronAPI.removeAllListeners("open-settings");
      }
    };
  }, []);

  return (
    <div
      id="zara-desktop-overlay"
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "transparent", overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* The Character (3D VRM) */}
        <div style={{ pointerEvents: "auto" }}>
          <VRMCharacter />
        </div>

        {/* Chat Bubble above character */}
        <ChatBubble />

        {/* Emotion Indicator */}
        <EmotionIndicator />

        {/* Settings Panel */}
        {showSettings && (
          <div
            style={{
              pointerEvents: "auto", position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", zIndex: 5000,
            }}
            onMouseEnter={() => window.electronAPI?.setIgnoreMouse(false)}
            onMouseLeave={() => window.electronAPI?.setIgnoreMouse(true)}
          >
            <SettingsPanel
              isOpen={showSettings}
              onClose={() => {
                setShowSettings(false);
                window.electronAPI?.setIgnoreMouse(true);
              }}
            />
          </div>
        )}

        {/* API Key missing hint */}
        {!geminiApiKey && (
          <div
            style={{
              position: "fixed", bottom: taskbarHeight + 300,
              left: "50%", transform: "translateX(-50%)",
              padding: "8px 16px", background: "rgba(251, 191, 36, 0.9)",
              borderRadius: "12px", color: "#000", fontSize: "12px",
              fontWeight: 600, pointerEvents: "auto", cursor: "pointer",
              zIndex: 4000, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            onClick={() => setShowSettings(true)}
            onMouseEnter={() => window.electronAPI?.setIgnoreMouse(false)}
            onMouseLeave={() => window.electronAPI?.setIgnoreMouse(true)}
          >
            ⚠️ API Key লাগবে! Click করো →
          </div>
        )}
      </div>
    </div>
  );
};

export default App;