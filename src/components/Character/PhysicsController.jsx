import { useCallback } from "react";
import { useCharacterStore } from "../../stores/characterStore";

const SCREEN_BOUNDS = {
  minX: 0,
  maxX: 100, // percentage
  minY: 0,
  maxY: 100,
};

const PhysicsController = ({ containerRef }) => {
  const { position, setPosition, setWalkTarget } = useCharacterStore();

  // Constrain position within bounds
  const clampPosition = useCallback((x, y) => {
    const clampedX = Math.max(SCREEN_BOUNDS.minX, Math.min(SCREEN_BOUNDS.maxX, x));
    const clampedY = Math.max(SCREEN_BOUNDS.minY, Math.min(SCREEN_BOUNDS.maxY, y));
    return { x: clampedX, y: clampedY };
  }, []);

  // Move character to position with boundary check
  const moveTo = useCallback((targetX, targetY, onComplete) => {
    const clamped = clampPosition(targetX, targetY);
    setWalkTarget(clamped);

    const step = () => {
      const current = useCharacterStore.getState().position;
      const dx = clamped.x - current.x;
      const dy = clamped.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        setPosition(clamped.x, clamped.y);
        onComplete?.();
        return false;
      }

      const speed = 0.08;
      const newX = current.x + dx * speed;
      const newY = current.y + dy * speed;
      const nextClamped = clampPosition(newX, newY);

      setPosition(nextClamped.x, nextClamped.y);
      return true;
    };

    let running = true;
    const animate = () => {
      if (!running) return;
      const continueStep = step();
      if (continueStep) {
        requestAnimationFrame(animate);
      }
    };
    animate();

    return () => {
      running = false;
    };
  }, [clampPosition, setPosition, setWalkTarget]);

  // Handle click to move
  const handleClick = useCallback((event) => {
    if (!containerRef?.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    moveTo(x, y);
  }, [moveTo]);

  return { moveTo, handleClick, clampPosition };
};

export default PhysicsController;