import { useConversationStore } from "../../stores/conversationStore";

const SubtitleBar = () => {
  const { currentMessage } = useConversationStore();

  if (!currentMessage) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(transparent, rgba(0, 0, 0, 0.9))",
        padding: "40px 12px 8px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          color: "#e0e0e0",
          fontSize: "13px",
          fontFamily: "'Noto Sans Bengali', 'Segoe UI', sans-serif",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
        }}
      >
        {currentMessage}
      </span>
    </div>
  );
};

export default SubtitleBar;