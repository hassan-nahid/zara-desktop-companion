import { useEffect, useRef } from "react";
import CharacterRenderer from "./components/Character/CharacterRenderer";
import ChatBubble from "./components/ChatBubble/ChatBubble";
import SubtitleBar from "./components/ChatBubble/SubtitleBar";
import { useCharacterStore } from "./stores/characterStore";

const App = () => {
  const containerRef = useRef(null);
  const { currentEmotion } = useCharacterStore();

  useEffect(() => {
    window.electronAPI?.setIgnoreMouse(false);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "300px",
        height: "500px",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <CharacterRenderer emotion={currentEmotion} />
      <SubtitleBar />

      {/* Demo emotion buttons */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          maxWidth: 100,
        }}
      >
        {["happy", "angry", "sad", "shy", "neutral"].map((emo) => (
          <button
            key={emo}
            onClick={() => useCharacterStore.getState().setEmotion(emo)}
            style={{
              padding: "4px 8px",
              fontSize: 10,
              background:
                currentEmotion === emo ? "#a78bfa" : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 4,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {emo}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
