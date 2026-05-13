import { useRef, useCallback } from "react";
import { useCharacterStore, SPRITE_STATES } from "../../stores/characterStore";
import { useMouseInteraction } from "../../hooks/useMouseInteraction";
import { useRelationshipStore, MOODS } from "../../stores/relationshipStore";

// Sprite image paths
const SPRITE_IMAGES = {
  [SPRITE_STATES.IDLE]: "/sprites/idle.png",
  [SPRITE_STATES.WALK]: ["/sprites/walk1.png", "/sprites/walk2.png"],
  [SPRITE_STATES.SIT]: "/sprites/sit.png",
  [SPRITE_STATES.HAPPY]: "/sprites/happy.png",
  [SPRITE_STATES.ANGRY]: "/sprites/angry.png",
  [SPRITE_STATES.SAD]: "/sprites/sad.png",
  [SPRITE_STATES.SHY]: "/sprites/shy.png",
  [SPRITE_STATES.LOVE]: "/sprites/love.png",
};

const SpriteCharacter = ({ onOpenChat }) => {
  const charRef = useRef(null);
  const {
    x,
    y,
    width,
    height,
    currentSprite,
    facingRight,
    isWalking,
    walkFrame,
    isBeingDragged,
    isSitting,
  } = useCharacterStore();
  
  const mood = useRelationshipStore((s) => s.mood);

  const {
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleMouseMove,
    handleDragStart,
  } = useMouseInteraction();

  // Get current sprite image source
  const getSpriteSrc = useCallback(() => {
    const spriteConfig = SPRITE_IMAGES[currentSprite];
    if (Array.isArray(spriteConfig)) {
      return spriteConfig[walkFrame % spriteConfig.length];
    }
    return spriteConfig || SPRITE_IMAGES[SPRITE_STATES.IDLE];
  }, [currentSprite, walkFrame]);

  // Handle character click - show chat input
  const handleCharacterClick = useCallback(
    (e) => {
      e.stopPropagation();
      handleClick();
      if (onOpenChat) {
        onOpenChat();
      }
    },
    [handleClick, onOpenChat]
  );

  const handleCharMouseMove = useCallback(
    (e) => {
      if (charRef.current) {
        const rect = charRef.current.getBoundingClientRect();
        handleMouseMove(e, rect);
      }
    },
    [handleMouseMove]
  );

  // Determine if character should be flipped
  const shouldFlip = !facingRight;
  
  // Angry-away means face is turned, show back
  const isAngryAway = (mood === MOODS.ANGRY || mood === MOODS.FIGHTING) && 
                       currentSprite === SPRITE_STATES.ANGRY;

  return (
    <div
      ref={charRef}
      data-character="zara"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleDragStart}
      onClick={handleCharacterClick}
      onMouseMove={handleCharMouseMove}
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isBeingDragged ? "grabbing" : "pointer",
        zIndex: 1000,
        transition: isBeingDragged ? "none" : "top 0.3s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Character Shadow */}
      <div
        style={{
          position: "absolute",
          bottom: isSitting ? -5 : 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "8px",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Character Image */}
      <img
        src={getSpriteSrc()}
        alt="Zara"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "bottom center",
          transform: `scaleX(${shouldFlip || isAngryAway ? -1 : 1}) ${
            isWalking ? `translateY(${Math.sin(Date.now() / 150) * 3}px)` : ""
          }`,
          transition: "transform 0.2s ease",
          filter: isBeingDragged
            ? "drop-shadow(0 8px 16px rgba(167, 139, 250, 0.5))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          imageRendering: "auto",
          pointerEvents: "none",
        }}
      />

      {/* Emotion Particles */}
      {currentSprite === SPRITE_STATES.LOVE && <LoveParticles />}
      {currentSprite === SPRITE_STATES.HAPPY && <SparkleParticles />}
      {currentSprite === SPRITE_STATES.ANGRY && <AngerParticles />}
      {currentSprite === SPRITE_STATES.SAD && <SadParticles />}
    </div>
  );
};

// Floating hearts for love state
const LoveParticles = () => (
  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        style={{
          position: "absolute",
          fontSize: "16px",
          top: `${10 + i * 15}%`,
          left: `${20 + Math.sin(i * 2) * 30 + 30}%`,
          animation: `floatHeart ${1.5 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
          opacity: 0.8,
        }}
      >
        💕
      </span>
    ))}
  </div>
);

// Sparkles for happy state
const SparkleParticles = () => (
  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
    {[...Array(4)].map((_, i) => (
      <span
        key={i}
        style={{
          position: "absolute",
          fontSize: "14px",
          top: `${5 + i * 20}%`,
          left: `${10 + i * 25}%`,
          animation: `sparkle ${1 + i * 0.2}s ease-in-out infinite`,
          animationDelay: `${i * 0.15}s`,
        }}
      >
        ✨
      </span>
    ))}
  </div>
);

// Anger marks
const AngerParticles = () => (
  <div style={{ position: "absolute", top: -5, right: 5, pointerEvents: "none" }}>
    <span
      style={{
        fontSize: "20px",
        animation: "angerPulse 0.8s ease-in-out infinite",
      }}
    >
      💢
    </span>
  </div>
);

// Sad tears
const SadParticles = () => (
  <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
    <span
      style={{
        fontSize: "14px",
        animation: "tearDrop 2s ease-in infinite",
      }}
    >
      💧
    </span>
  </div>
);

export default SpriteCharacter;
