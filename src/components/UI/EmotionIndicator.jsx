import { useRelationshipStore, MOODS } from "../../stores/relationshipStore";
import { useCharacterStore } from "../../stores/characterStore";

const MOOD_INDICATORS = {
  [MOODS.LOVE]: { emoji: "💕", label: "ভালোবাসা", color: "#f472b6" },
  [MOODS.HAPPY]: { emoji: "😊", label: "খুশি", color: "#a78bfa" },
  [MOODS.NEUTRAL]: { emoji: "😐", label: "স্বাভাবিক", color: "#94a3b8" },
  [MOODS.IRRITATED]: { emoji: "😒", label: "বিরক্ত", color: "#fb923c" },
  [MOODS.ANGRY]: { emoji: "😠", label: "রাগ", color: "#f87171" },
  [MOODS.FIGHTING]: { emoji: "💢", label: "ঝগড়া!", color: "#ef4444" },
  [MOODS.FORGIVING]: { emoji: "🥺", label: "ক্ষমা?", color: "#c084fc" },
};

const EmotionIndicator = () => {
  const mood = useRelationshipStore((s) => s.mood);
  const loveMeter = useRelationshipStore((s) => s.loveMeter);
  const { x, y, width } = useCharacterStore();

  const indicator = MOOD_INDICATORS[mood] || MOOD_INDICATORS[MOODS.NEUTRAL];

  // Position above and to the right of character
  const indicatorX = x + width - 10;
  const indicatorY = y - 5;

  return (
    <div
      style={{
        position: "absolute",
        left: `${indicatorX}px`,
        top: `${indicatorY}px`,
        zIndex: 1500,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
      }}
    >
      {/* Mood emoji */}
      <div
        style={{
          fontSize: "18px",
          animation: "moodBounce 2s ease-in-out infinite",
          filter: `drop-shadow(0 2px 4px ${indicator.color}40)`,
        }}
        title={indicator.label}
      >
        {indicator.emoji}
      </div>

      {/* Love meter bar (tiny) */}
      <div
        style={{
          width: "24px",
          height: "3px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${loveMeter}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${indicator.color}, #f472b6)`,
            borderRadius: "2px",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
};

export default EmotionIndicator;
