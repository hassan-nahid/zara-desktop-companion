import { useEffect, useState } from "react";
import { useConversationStore } from "../../stores/conversationStore";

const ChatBubble = () => {
  const { currentMessage, isSpeaking, isTyping } = useConversationStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (currentMessage) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [currentMessage]);

  if (!visible && !currentMessage) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "90%",
        background: "rgba(0, 0, 0, 0.85)",
        borderRadius: "16px",
        padding: "12px 16px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        animation: visible ? "fadeIn 0.3s ease" : "fadeOut 0.3s ease",
        zIndex: 100,
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: "14px",
          lineHeight: 1.5,
          textAlign: "center",
          fontFamily: "'Noto Sans Bengali', 'Segoe UI', sans-serif",
        }}
      >
        {currentMessage || "..."}
      </div>
      {isSpeaking && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            marginTop: "8px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "#a78bfa",
                animation: "pulse 1s infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;