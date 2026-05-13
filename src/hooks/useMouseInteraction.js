import { useCallback, useRef, useEffect } from "react";
import { useCharacterStore, SPRITE_STATES } from "../stores/characterStore";
import { useRelationshipStore, MOODS } from "../stores/relationshipStore";
import { useConversationStore } from "../stores/conversationStore";

export const useMouseInteraction = () => {
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const petTimerRef = useRef(null);
  const petCountRef = useRef(0);
  const hoverTimerRef = useRef(null);

  // Handle mouse entering character area
  const handleMouseEnter = useCallback(() => {
    // Enable mouse events on the window
    window.electronAPI?.setIgnoreMouse(false);

    // Start hover timer for shy reaction
    hoverTimerRef.current = setTimeout(() => {
      const relStore = useRelationshipStore.getState();
      if (relStore.mood !== MOODS.ANGRY && relStore.mood !== MOODS.FIGHTING) {
        const store = useCharacterStore.getState();
        if (!store.isWalking && !store.isSitting) {
          store.setSprite(SPRITE_STATES.SHY);
          setTimeout(() => {
            const s = useCharacterStore.getState();
            if (s.currentSprite === SPRITE_STATES.SHY) {
              s.setSprite(SPRITE_STATES.IDLE);
            }
          }, 2000);
        }
      }
    }, 3000);
  }, []);

  // Handle mouse leaving character area
  const handleMouseLeave = useCallback(() => {
    if (!isDraggingRef.current) {
      // Re-enable click-through
      window.electronAPI?.setIgnoreMouse(true);
    }
    clearTimeout(hoverTimerRef.current);
  }, []);

  // Handle click (poke)
  const handleClick = useCallback(() => {
    const relStore = useRelationshipStore.getState();
    const store = useCharacterStore.getState();

    if (relStore.mood === MOODS.FIGHTING) {
      // She's ignoring you during a fight
      useConversationStore.getState().setCurrentMessage("হুম! 😤");
      return;
    }

    if (relStore.mood === MOODS.ANGRY) {
      useConversationStore.getState().setCurrentMessage("কী চাও? 😠");
      return;
    }

    // Normal poke reactions
    const reactions = [
      "কী হলো? 😊",
      "হ্যাঁ? বলো! ✨",
      "হেহে, কিচ্ছু না! 😄",
      "তুমি আমাকে ডাকছো? 💜",
      "কিরে! 😆",
      "বলো বলো, শুনছি! 👂",
    ];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    useConversationStore.getState().setCurrentMessage(reaction);

    // Brief happy sprite
    store.setSprite(SPRITE_STATES.HAPPY);
    setTimeout(() => {
      const s = useCharacterStore.getState();
      if (s.currentSprite === SPRITE_STATES.HAPPY && !s.isWalking) {
        s.setSprite(SPRITE_STATES.IDLE);
      }
    }, 1500);

    relStore.recordInteraction();
  }, []);

  // Handle mouse move over character (head pat detection)
  const handleMouseMove = useCallback((e, characterRect) => {
    if (isDraggingRef.current) return;

    // Check if mouse is over the "head" area (top 30% of character)
    if (characterRect) {
      const headTop = characterRect.top;
      const headBottom = characterRect.top + characterRect.height * 0.3;

      if (e.clientY >= headTop && e.clientY <= headBottom) {
        // Head area - count as petting
        petCountRef.current++;

        if (petCountRef.current > 5 && !petTimerRef.current) {
          // Trigger pet reaction
          const store = useCharacterStore.getState();
          const relStore = useRelationshipStore.getState();

          if (relStore.mood !== MOODS.FIGHTING) {
            store.setSprite(SPRITE_STATES.LOVE);
            store.setPetted(true);
            useConversationStore.getState().setCurrentMessage("আহ... ভালো লাগছে~ 💕");
            relStore.processHeadPat();

            petTimerRef.current = setTimeout(() => {
              const s = useCharacterStore.getState();
              s.setPetted(false);
              if (s.currentSprite === SPRITE_STATES.LOVE && !s.isWalking) {
                s.setSprite(SPRITE_STATES.IDLE);
              }
              petTimerRef.current = null;
              petCountRef.current = 0;
            }, 3000);
          }
        }
      }
    }
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    const store = useCharacterStore.getState();
    isDraggingRef.current = true;
    store.setDragging(true);

    dragOffsetRef.current = {
      x: e.clientX - store.x,
      y: e.clientY - store.y,
    };

    // Disable click-through while dragging
    window.electronAPI?.setIgnoreMouse(false);
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const store = useCharacterStore.getState();
    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;
    store.setPosition(newX, newY);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((groundY) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    const store = useCharacterStore.getState();
    store.setDragging(false);

    // Gravity - drop back to ground
    const targetY = groundY - store.height;
    const dropAnim = () => {
      const s = useCharacterStore.getState();
      if (s.y < targetY) {
        s.setY(Math.min(s.y + 8, targetY));
        requestAnimationFrame(dropAnim);
      }
    };
    if (store.y < targetY) {
      requestAnimationFrame(dropAnim);
    }

    // Re-enable click-through
    window.electronAPI?.setIgnoreMouse(true);

    // She finds being picked up fun!
    useConversationStore.getState().setCurrentMessage("উয়াআআ! 😲 নামাও আমাকে!");
    store.setSprite(SPRITE_STATES.HAPPY);
    setTimeout(() => {
      const s = useCharacterStore.getState();
      if (!s.isWalking) {
        s.setSprite(SPRITE_STATES.IDLE);
      }
    }, 2000);
  }, []);

  // Global mouse up listener for drag
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        // Use screen info to determine ground
        handleDragEnd(window.innerHeight - 48 - 260);
      }
    };

    const handleGlobalMouseMove = (e) => {
      if (isDraggingRef.current) {
        handleDragMove(e);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      clearTimeout(petTimerRef.current);
      clearTimeout(hoverTimerRef.current);
    };
  }, [handleDragMove, handleDragEnd]);

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleMouseMove,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
