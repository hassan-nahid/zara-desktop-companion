import { useConversationStore } from "../../stores/conversationStore";

const VoiceIndicator = () => {
  const { isSpeaking, isTyping } = useConversationStore();

  if (!isSpeaking && !isTyping) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        background: "rgba(0, 0, 0, 0.6)",
        borderRadius: "20px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: isSpeaking ? "#4ade80" : "#fbbf24",
          animation: "pulse 1s infinite",
        }}
      />
      <span
        style={{
          color: "#fff",
          fontSize: "11px",
          fontWeight: "500",
        }}
      >
        {isSpeaking ? "Speaking" : "Thinking..."}
      </span>
    </div>
  );
};

export default VoiceIndicator;