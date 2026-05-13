import { useConversationStore } from "../../stores/conversationStore";
import { useCharacterStore } from "../../stores/characterStore";
import { useRelationshipStore, MOODS } from "../../stores/relationshipStore";

const MOOD_COLORS = {
  [MOODS.LOVE]: { border: "#f472b6", bg: "rgba(244, 114, 182, 0.15)" },
  [MOODS.HAPPY]: { border: "#a78bfa", bg: "rgba(167, 139, 250, 0.15)" },
  [MOODS.NEUTRAL]: { border: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" },
  [MOODS.IRRITATED]: { border: "#fb923c", bg: "rgba(251, 146, 60, 0.15)" },
  [MOODS.ANGRY]: { border: "#f87171", bg: "rgba(248, 113, 113, 0.15)" },
  [MOODS.FIGHTING]: { border: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
  [MOODS.FORGIVING]: { border: "#a78bfa", bg: "rgba(167, 139, 250, 0.15)" },
};

const ChatBubble = () => {
  const { currentMessage, showBubble, isTyping } = useConversationStore();
  const { x, y, width } = useCharacterStore();
  const mood = useRelationshipStore((s) => s.mood);

  if (!showBubble && !isTyping) return null;

  const moodColor = MOOD_COLORS[mood] || MOOD_COLORS[MOODS.NEUTRAL];

  // Position bubble above character's head
  const bubbleX = x + width / 2;
  const bubbleY = y - 20;

  return (
    <div
      style={{
        position: "absolute",
        left: `${bubbleX}px`,
        top: `${bubbleY}px`,
        transform: "translate(-50%, -100%)",
        zIndex: 2000,
        pointerEvents: "none",
        animation: "bubbleAppear 0.3s ease-out",
      }}
    >
      {/* Bubble */}
      <div
        style={{
          background: "rgba(15, 15, 25, 0.92)",
          backdropFilter: "blur(12px)",
          borderRadius: "16px",
          padding: "10px 16px",
          border: `2px solid ${moodColor.border}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${moodColor.bg}`,
          maxWidth: "260px",
          minWidth: "80px",
          position: "relative",
        }}
      >
        {/* Message text */}
        <div
          style={{
            color: "#f0f0f0",
            fontSize: "14px",
            lineHeight: 1.5,
            textAlign: "center",
            fontFamily: "'Noto Sans Bengali', 'Segoe UI', sans-serif",
            wordBreak: "break-word",
          }}
        >
          {isTyping && !currentMessage ? (
            <span style={{ color: "#a78bfa" }}>
              <span style={{ animation: "dotPulse 1.2s infinite" }}>●</span>
              <span style={{ animation: "dotPulse 1.2s infinite 0.2s" }}>●</span>
              <span style={{ animation: "dotPulse 1.2s infinite 0.4s" }}>●</span>
            </span>
          ) : (
            currentMessage
          )}
        </div>

        {/* Pointer arrow */}
        <div
          style={{
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `8px solid ${moodColor.border}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid rgba(15, 15, 25, 0.92)",
          }}
        />
      </div>
    </div>
  );
};

export default ChatBubble;