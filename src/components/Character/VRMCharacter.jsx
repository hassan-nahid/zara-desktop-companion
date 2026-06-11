import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { useCharacterStore, SPRITE_STATES } from "../../stores/characterStore";
import { useMouseInteraction } from "../../hooks/useMouseInteraction";
import { useRelationshipStore, MOODS } from "../../stores/relationshipStore";
import { useSettingsStore } from "../../stores/settingsStore";

const VRM_URL = "/models/avatar.vrm";

const EMOTION_EXPRESSIONS = {
  neutral: { happy: 0, angry: 0, sad: 0, relaxed: 0.2 },
  happy: { happy: 1, angry: 0, sad: 0, relaxed: 0 },
  angry: { happy: 0, angry: 1, sad: 0, relaxed: 0 },
  sad: { happy: 0, angry: 0, sad: 1, relaxed: 0 },
  shy: { happy: 0.4, angry: 0, sad: 0, relaxed: 0.5 },
  surprised: { happy: 0, angry: 0, sad: 0, surprised: 1 },
  excited: { happy: 0.9, angry: 0, sad: 0, relaxed: 0 },
  love: { happy: 0.7, angry: 0, sad: 0, relaxed: 0.5 },
  sleeping: { happy: 0, angry: 0, sad: 0, relaxed: 0.8 },
};

const ARM_REST = {
  leftUpperArmZ: 1.05,
  rightUpperArmZ: -1.05,
  leftLowerArmZ: 0.08,
  rightLowerArmZ: -0.08,
};

const DANCE_POSES = [
  { lUL: -0.5, rUL: -0.5, lLL: 0.3, rLL: 0.3, lUA_z: 0.5, rUA_z: -0.5, lUA_x: -0.3, rUA_x: -0.3, lLA_z: 0.3, rLA_z: -0.3 },
  { lUL: -0.8, rUL: -0.8, lLL: 0.6, rLL: 0.6, lUA_z: 0.8, rUA_z: -0.8, lUA_x: -0.5, rUA_x: -0.5, lLA_z: 0.5, rLA_z: -0.5 },
  { lUL: -0.3, rUL: -0.3, lLL: 0.5, rLL: 0.5, lUA_z: 1.0, rUA_z: -1.0, lUA_x: 0, rUA_x: 0, lLA_z: 0.1, rLA_z: -0.1 },
  { lUL: -1.0, rUL: -1.0, lLL: 0.4, rLL: 0.4, lUA_z: 0.3, rUA_z: -0.3, lUA_x: -0.8, rUA_x: -0.8, lLA_z: 0.6, rLA_z: -0.6 },
];

const VRMCharacter = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const vrmRef = useRef(null);
  const parentGroupRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animFrameRef = useRef(null);
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(3 + Math.random() * 4);
  const emotionLerpRef = useRef({});
  const boneLerpRef = useRef({});
  const charRef = useRef(null);
  const composerRef = useRef(null);
  const danceTimerRef = useRef(0);
  const currentDancePoseRef = useRef(0);
  const sleepTimerRef = useRef(0);
  const audioLevelRef = useRef(0);

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const { x, y, width, height, currentSprite, isBeingDragged, isSitting } = useCharacterStore();
  const mood = useRelationshipStore((s) => s.mood);
  const {
    chibiMode,
    bigScreenMode,
    sleepMode,
    danceMode,
    postProcessing,
  } = useSettingsStore();
  const { handleMouseEnter, handleMouseLeave, handleClick, handleMouseMove, handleDragStart } = useMouseInteraction();

  // Dynamic dimensions
  const charWidth = useMemo(() => chibiMode ? 100 : (bigScreenMode ? 400 : width), [chibiMode, bigScreenMode, width]);
  const charHeight = useMemo(() => chibiMode ? 140 : (bigScreenMode ? 560 : height), [chibiMode, bigScreenMode, height]);

  const handleCharacterClick = useCallback((e) => {
    e.stopPropagation();
    handleClick();
  }, [handleClick]);

  const handleCharMouseMove = useCallback((e) => {
    if (charRef.current) {
      handleMouseMove(e, charRef.current.getBoundingClientRect());
    }
  }, [handleMouseMove]);

  const lerpBone = useCallback((key, target, delta, speed = 5) => {
    const cur = boneLerpRef.current[key] ?? target;
    const val = cur + (target - cur) * Math.min(delta * speed, 1);
    boneLerpRef.current[key] = val;
    return val;
  }, []);

  // ===== Init scene + load VRM =====
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(20, container.clientWidth / container.clientHeight, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing composer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composerRef.current = composer;

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.4, 0.3, 0.15
    );
    bloomPass.name = "bloom";
    bloomPass.enabled = false;
    composer.addPass(bloomPass);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const kl = new THREE.DirectionalLight(0xfff5ee, 2.0);
    kl.position.set(3, 5, 5);
    scene.add(kl);
    const fl = new THREE.DirectionalLight(0xc4b5fd, 0.6);
    fl.position.set(-3, 3, 2);
    scene.add(fl);
    const rl = new THREE.DirectionalLight(0xa78bfa, 0.8);
    rl.position.set(0, 3, -3);
    scene.add(rl);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    const loadModel = async () => {
      let modelUrl = VRM_URL;
      if (!import.meta.env.DEV && window.electronAPI?.getModelUrl) {
        try { modelUrl = await window.electronAPI.getModelUrl("avatar.vrm"); } catch {}
      }

      loader.load(modelUrl, (gltf) => {
        const vrm = gltf.userData.vrm;
        if (!vrm) { setLoadError("No VRM data"); return; }

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);

        const group = new THREE.Group();
        group.rotation.y = Math.PI;
        group.add(vrm.scene);
        parentGroupRef.current = group;

        const box = new THREE.Box3().setFromObject(vrm.scene);
        const size = box.getSize(new THREE.Vector3());
        vrm.scene.position.y = -box.min.y;

        const h = size.y;
        const ty = h * 0.45;
        const fov = THREE.MathUtils.degToRad(camera.fov * 0.5);
        const dist = (h / (2 * Math.tan(fov))) * 1.15;
        camera.position.set(0, ty, dist);
        camera.lookAt(0, ty, 0);
        camera.updateProjectionMatrix();

        scene.add(group);
        vrmRef.current = vrm;
        setLoaded(true);

        if (vrm.expressionManager?._expressionMap) {
          console.log("VRM expressions:", Object.keys(vrm.expressionManager._expressionMap));
        }
      }, undefined, (err) => { setLoadError(err.message); });
    };
    loadModel();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // ===== Toggle post-processing =====
  useEffect(() => {
    if (!composerRef.current) return;
    composerRef.current.passes.forEach((p) => {
      if (p.name === "bloom") p.enabled = postProcessing;
    });
  }, [postProcessing]);

  // ===== Listen for audio level from dance hook =====
  useEffect(() => {
    const handleAudio = (e) => {
      audioLevelRef.current = e.detail.level || 0;
    };
    window.addEventListener("zara-audio-level", handleAudio);
    return () => window.removeEventListener("zara-audio-level", handleAudio);
  }, []);

  // ===== Animation loop =====
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();
      const vrm = vrmRef.current;
      const settings = useSettingsStore.getState();

      if (!vrm) {
        if (composerRef.current) {
          composerRef.current.render();
        } else {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        return;
      }

      const state = useCharacterStore.getState();

      // ---- Facial expressions ----
      if (vrm.expressionManager) {
        let emo = state.currentEmotion || "neutral";

        if (settings.sleepMode && state.isSitting && state.currentBehavior === "sitting") {
          const relStore = useRelationshipStore.getState();
          if (relStore.ignoreMinutes >= 5) emo = "sleeping";
        }

        if (state.currentSprite === SPRITE_STATES.ANGRY) emo = "angry";
        else if (state.currentSprite === SPRITE_STATES.HAPPY) emo = "happy";
        else if (state.currentSprite === SPRITE_STATES.SAD) emo = "sad";
        else if (state.currentSprite === SPRITE_STATES.SHY) emo = "shy";
        else if (state.currentSprite === SPRITE_STATES.LOVE) emo = "love";

        const targets = EMOTION_EXPRESSIONS[emo] || EMOTION_EXPRESSIONS.neutral;
        for (const [name, tv] of Object.entries(targets)) {
          const c = emotionLerpRef.current[name] || 0;
          emotionLerpRef.current[name] = c + (tv - c) * Math.min(delta * 4, 1);
          try { vrm.expressionManager.setValue(name, emotionLerpRef.current[name]); } catch {}
        }

        blinkTimerRef.current += delta;
        if (blinkTimerRef.current >= nextBlinkRef.current) {
          blinkTimerRef.current = 0;
          nextBlinkRef.current = 2 + Math.random() * 5;
        }
        const bp = blinkTimerRef.current;
        const bv = bp < 0.08 ? bp / 0.08 : bp < 0.16 ? 1 - (bp - 0.08) / 0.08 : 0;
        try { vrm.expressionManager.setValue("blink", bv); } catch {}
        vrm.expressionManager.update(delta);
      }

      // ---- Breathing ----
      if (vrm.scene) {
        if (vrm.scene.userData._baseY === undefined) vrm.scene.userData._baseY = vrm.scene.position.y;
        const breatheAmplitude = settings.bigScreenMode ? 0.008 : (settings.chibiMode ? 0.003 : 0.005);
        const breatheSpeed = settings.sleepMode ? 1.2 : 1.8;
        vrm.scene.position.y = vrm.scene.userData._baseY + Math.sin(elapsed * breatheSpeed) * breatheAmplitude;
      }

      // ---- Dance animation ----
      const isDancing = settings.danceMode && audioLevelRef.current > 0.08;

      // ---- Bone poses ----
      if (vrm.humanoid) {
        const gb = (n) => vrm.humanoid.getNormalizedBoneNode(n);
        const lUL = gb("leftUpperLeg"), rUL = gb("rightUpperLeg");
        const lLL = gb("leftLowerLeg"), rLL = gb("rightLowerLeg");
        const lUA = gb("leftUpperArm"), rUA = gb("rightUpperArm");
        const lLA = gb("leftLowerArm"), rLA = gb("rightLowerArm");
        const spine = gb("spine"), head = gb("head");

        if (isDancing) {
          // Dance animation driven by audio
          danceTimerRef.current += delta;
          const beatSpeed = 4 + audioLevelRef.current * 8;
          const beat = Math.sin(danceTimerRef.current * beatSpeed);

          const react = audioLevelRef.current * settings.danceReactivity * 2;

          if (lUL) lUL.rotation.x = lerpBone("lUL_x", -0.5 + beat * 0.3 * react, delta, 8);
          if (rUL) rUL.rotation.x = lerpBone("rUL_x", -0.5 - beat * 0.3 * react, delta, 8);
          if (lLL) lLL.rotation.x = lerpBone("lLL_x", 0.3 + Math.sin(elapsed * beatSpeed) * 0.2 * react, delta, 8);
          if (rLL) rLL.rotation.x = lerpBone("rLL_x", 0.3 + Math.cos(elapsed * beatSpeed) * 0.2 * react, delta, 8);
          if (lUA) {
            lUA.rotation.z = lerpBone("lUA_z", 0.5 + beat * 0.3 * react, delta, 8);
            lUA.rotation.x = lerpBone("lUA_x", -0.3 - Math.abs(beat) * 0.3 * react, delta, 8);
          }
          if (rUA) {
            rUA.rotation.z = lerpBone("rUA_z", -0.5 - beat * 0.3 * react, delta, 8);
            rUA.rotation.x = lerpBone("rUA_x", -0.3 - Math.abs(beat) * 0.3 * react, delta, 8);
          }
          if (lLA) lLA.rotation.z = lerpBone("lLA_z", 0.3 + beat * 0.2 * react, delta, 8);
          if (rLA) rLA.rotation.z = lerpBone("rLA_z", -0.3 - beat * 0.2 * react, delta, 8);
          if (spine) spine.rotation.z = lerpBone("spine_z", beat * 0.05 * react, delta, 6);
          if (head) {
            head.rotation.y = lerpBone("head_y", beat * 0.08 * react, delta, 5);
            head.rotation.x = lerpBone("head_x", Math.sin(elapsed * 0.5) * 0.04, delta, 3);
          }

          // Body bounce
          if (vrm.scene) {
            const bounce = Math.abs(beat) * 0.01 * react;
            vrm.scene.position.y = vrm.scene.userData._baseY + bounce;
          }
        } else if (state.isSitting) {
          danceTimerRef.current = 0;

          // Sitting with dangling legs
          const dangle = Math.sin(elapsed * 1.5) * 0.15;
          if (lUL) lUL.rotation.x = lerpBone("lUL_x", -1.5, delta, 4);
          if (rUL) rUL.rotation.x = lerpBone("rUL_x", -1.5, delta, 4);
          if (lLL) lLL.rotation.x = lerpBone("lLL_x", 0.8 + dangle, delta, 4);
          if (rLL) rLL.rotation.x = lerpBone("rLL_x", 0.8 - dangle * 0.7, delta, 4);
          if (lUA) { lUA.rotation.z = lerpBone("lUA_z", ARM_REST.leftUpperArmZ * 0.85, delta, 4); lUA.rotation.x = lerpBone("lUA_x", -0.2, delta, 4); }
          if (rUA) { rUA.rotation.z = lerpBone("rUA_z", ARM_REST.rightUpperArmZ * 0.85, delta, 4); rUA.rotation.x = lerpBone("rUA_x", -0.2, delta, 4); }
          if (lLA) lLA.rotation.z = lerpBone("lLA_z", 0.15, delta, 4);
          if (rLA) rLA.rotation.z = lerpBone("rLA_z", -0.15, delta, 4);
          if (spine) spine.rotation.z = lerpBone("spine_z", 0, delta, 4);
          if (head) { head.rotation.x = lerpBone("head_x", Math.sin(elapsed * 0.4) * 0.04, delta, 3); head.rotation.y = lerpBone("head_y", Math.sin(elapsed * 0.3) * 0.06, delta, 3); }
        } else {
          danceTimerRef.current = 0;

          // Idle standing
          if (lUL) lUL.rotation.x = lerpBone("lUL_x", 0, delta, 5);
          if (rUL) rUL.rotation.x = lerpBone("rUL_x", 0, delta, 5);
          if (lLL) lLL.rotation.x = lerpBone("lLL_x", 0, delta, 5);
          if (rLL) rLL.rotation.x = lerpBone("rLL_x", 0, delta, 5);
          if (lUA) { lUA.rotation.z = lerpBone("lUA_z", ARM_REST.leftUpperArmZ, delta, 4); lUA.rotation.x = lerpBone("lUA_x", 0, delta, 4); }
          if (rUA) { rUA.rotation.z = lerpBone("rUA_z", ARM_REST.rightUpperArmZ, delta, 4); rUA.rotation.x = lerpBone("rUA_x", 0, delta, 4); }
          if (lLA) lLA.rotation.z = lerpBone("lLA_z", ARM_REST.leftLowerArmZ, delta, 4);
          if (rLA) rLA.rotation.z = lerpBone("rLA_z", ARM_REST.rightLowerArmZ, delta, 4);
          if (spine) spine.rotation.z = lerpBone("spine_z", 0, delta, 4);
          if (head) { head.rotation.y = lerpBone("head_y", Math.sin(elapsed * 0.5) * 0.06, delta, 3); head.rotation.x = lerpBone("head_x", Math.sin(elapsed * 0.3) * 0.03, delta, 3); }
        }
      }

      vrm.update(delta);

      if (composerRef.current && settings.postProcessing) {
        composerRef.current.render();
      } else {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [loaded, lerpBone]);

  // Angry-away: turn back
  const isAngryAway = (mood === MOODS.ANGRY || mood === MOODS.FIGHTING) && currentSprite === SPRITE_STATES.ANGRY;
  useEffect(() => {
    if (!parentGroupRef.current) return;
    parentGroupRef.current.rotation.y = isAngryAway ? 0 : Math.PI;
  }, [isAngryAway]);

  return (
    <div ref={charRef} data-character="zara"
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      onMouseDown={handleDragStart} onClick={handleCharacterClick} onMouseMove={handleCharMouseMove}
      style={{
        position: "absolute", left: `${x}px`, top: `${y}px`,
        width: `${charWidth}px`, height: `${charHeight}px`,
        cursor: isBeingDragged ? "grabbing" : "pointer", zIndex: 1000,
        transition: isBeingDragged ? "none" : "top 0.3s ease, width 0.5s ease, height 0.5s ease",
        userSelect: "none", WebkitUserSelect: "none",
        transform: bigScreenMode ? "scale(1.8)" : (chibiMode ? "scale(0.45)" : "scale(1)"),
        transformOrigin: "bottom center",
      }}>
      <div ref={containerRef} style={{
        width: "100%", height: "100%", pointerEvents: "none",
        filter: isBeingDragged ? "drop-shadow(0 12px 24px rgba(167,139,250,0.6))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
        transition: "filter 0.3s ease",
      }} />
      {!loaded && !loadError && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#a78bfa", fontSize: "14px", fontWeight: 600, animation: "pulse 1.5s ease-in-out infinite" }}>✨ Loading...</div>
      )}
      {currentSprite === SPRITE_STATES.LOVE && <LoveParticles />}
      {currentSprite === SPRITE_STATES.HAPPY && <SparkleParticles />}
      {currentSprite === SPRITE_STATES.ANGRY && <AngerParticles />}
      {currentSprite === SPRITE_STATES.SAD && <SadParticles />}
    </div>
  );
};

const LoveParticles = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
    {[...Array(6)].map((_, i) => (<span key={i} style={{ position: "absolute", fontSize: `${14+i*2}px`, top: `${5+i*12}%`, left: `${15+Math.sin(i*1.5)*30+30}%`, animation: `floatHeart ${1.2+i*0.25}s ease-in-out infinite`, animationDelay: `${i*0.15}s`, opacity: 0.9 }}>💕</span>))}
  </div>
);
const SparkleParticles = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
    {[...Array(5)].map((_, i) => (<span key={i} style={{ position: "absolute", fontSize: `${12+i*2}px`, top: `${3+i*18}%`, left: `${8+i*22}%`, animation: `sparkle ${0.8+i*0.2}s ease-in-out infinite`, animationDelay: `${i*0.12}s` }}>✨</span>))}
  </div>
);
const AngerParticles = () => (
  <div style={{ position: "absolute", top: -8, right: 8, pointerEvents: "none" }}>
    <span style={{ fontSize: "22px", animation: "angerPulse 0.6s ease-in-out infinite" }}>💢</span>
  </div>
);
const SadParticles = () => (
  <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
    {[...Array(3)].map((_, i) => (<span key={i} style={{ position: "absolute", left: `${-10+i*15}px`, fontSize: "14px", animation: `tearDrop ${1.5+i*0.3}s ease-in infinite`, animationDelay: `${i*0.5}s` }}>💧</span>))}
  </div>
);

export default VRMCharacter;
