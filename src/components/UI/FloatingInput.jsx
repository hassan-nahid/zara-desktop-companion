import { useState, useRef, useEffect, useCallback } from "react";
import { useCharacterStore } from "../../stores/characterStore";
import { useRelationshipStore, MOODS } from "../../stores/relationshipStore";

const FloatingInput = ({ isOpen, onClose, onSend }) => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);
  const { x, y, width, height } = useCharacterStore();
  const mood = useRelationshipStore((s) => s.mood);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!text.trim() || isProcessing) return;

      const msg = text.trim();
      setText("");
      setIsProcessing(true);

      try {
        await onSend(msg);
      } catch (err) {
        console.error("Send error:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [text, isProcessing, onSend]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [handleSubmit, onClose]
  );

  if (!isOpen) return null;

  // Position input near character
  const inputX = x + width / 2;
  const inputY = y + height + 10;

  // Determine accent color based on mood
  const accentColor =
    mood === MOODS.ANGRY || mood === MOODS.FIGHTING
      ? "#f87171"
      : mood === MOODS.LOVE
      ? "#f472b6"
      : "#a78bfa";

  return (
    <div
      style={{
        position: "absolute",
        left: `${inputX}px`,
        top: `${inputY}px`,
        transform: "translateX(-50%)",
        zIndex: 3000,
        animation: "inputSlideUp 0.2s ease-out",
      }}
      onMouseEnter={() => window.electronAPI?.setIgnoreMouse(false)}
      onMouseLeave={() => {
        if (!text.trim()) {
          window.electronAPI?.setIgnoreMouse(true);
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "center",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mood === MOODS.FIGHTING
              ? "সে রাগ করেছে..."
              : mood === MOODS.ANGRY
              ? "কিছু বলো..."
              : "Zara কে কিছু বলো..."
          }
          disabled={isProcessing}
          style={{
            width: "220px",
            padding: "10px 16px",
            background: "rgba(15, 15, 25, 0.92)",
            backdropFilter: "blur(12px)",
            border: `2px solid ${accentColor}40`,
            borderRadius: "24px",
            color: "#fff",
            fontSize: "13px",
            fontFamily: "'Noto Sans Bengali', 'Segoe UI', sans-serif",
            outline: "none",
            transition: "border-color 0.2s",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = accentColor;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = `${accentColor}40`;
          }}
        />
        <button
          type="submit"
          disabled={isProcessing || !text.trim()}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            background:
              text.trim() && !isProcessing
                ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                : "rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "14px",
            cursor: text.trim() && !isProcessing ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            boxShadow:
              text.trim() && !isProcessing
                ? `0 2px 12px ${accentColor}60`
                : "none",
          }}
        >
          {isProcessing ? "⏳" : "➤"}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.08)",
            color: "#888",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </form>
    </div>
  );
};

export default FloatingInput;
