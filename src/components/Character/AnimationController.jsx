import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

const AnimationController = ({ vrm, modelRef }) => {
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!vrm?.scene) return;

    // Animation mixer for VRM animations
    const mixer = new THREE.AnimationMixer(vrm.scene);
    mixerRef.current = mixer;

    return () => {
      mixer?.stopAllAction();
    };
  }, [vrm]);

  // Play a specific animation
  const playAnimation = useCallback((animationName, loop = true) => {
    if (!mixerRef.current) return;

    const action = actionsRef.current[animationName];
    if (!action) return;

    action.reset();
    if (!loop) {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }
    action.play();
  }, []);

  // Stop current animation
  const stopAnimation = useCallback((animationName) => {
    if (!mixerRef.current || !actionsRef.current[animationName]) return;
    actionsRef.current[animationName].stop();
  }, []);

  // Update mixer in animation loop
  useEffect(() => {
    let animationFrame;

    const update = () => {
      if (mixerRef.current) {
        const delta = clockRef.current.getDelta();
        mixerRef.current.update(delta);
      }
      animationFrame = requestAnimationFrame(update);
    };
    update();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Preset animations
  const animations = {
    wave: () => {
      // Trigger wave hand animation
      if (modelRef?.current) {
        modelRef.current.rotation.z = 0.2;
        setTimeout(() => {
          if (modelRef?.current) modelRef.current.rotation.z = 0;
        }, 500);
      }
    },
    nod: () => {
      // Trigger nod animation
      if (modelRef?.current) {
        modelRef.current.rotation.x = -0.1;
        setTimeout(() => {
          if (modelRef?.current) modelRef.current.rotation.x = 0.1;
        }, 200);
        setTimeout(() => {
          if (modelRef?.current) modelRef.current.rotation.x = 0;
        }, 400);
      }
    },
    lookAround: () => {
      // Trigger look around animation
      if (modelRef?.current) {
        modelRef.current.rotation.y = 0.3;
        setTimeout(() => {
          if (modelRef?.current) modelRef.current.rotation.y = -0.3;
        }, 1000);
        setTimeout(() => {
          if (modelRef?.current) modelRef.current.rotation.y = 0;
        }, 2000);
      }
    },
  };

  return { playAnimation, stopAnimation, animations, animations };
};

export default AnimationController;