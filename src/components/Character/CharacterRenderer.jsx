import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

const VRM_URL = "/models/avatar.vrm";

const emotionColors = {
  neutral: "#a78bfa",
  happy: "#4ade80",
  angry: "#f87171",
  sad: "#60a5fa",
  shy: "#f9a8d4",
  surprised: "#fbbf24",
  excited: "#f472b6",
};

const emotionWeights = {
  happy: {
    Happy: 1,
  },
  angry: {
    Angry: 1,
  },
  sad: {
    Sad: 1,
  },
  shy: {
    Happy: 0.3,
    Neutral: 0.5,
  },
  surprised: {
    Surprised: 1,
  },
  excited: {
    Happy: 0.8,
  },
  neutral: {
    Neutral: 1,
  },
};

const CharacterRenderer = ({ emotion = "neutral" }) => {
  const containerRef = useRef(null);
  const vrmRef = useRef(null);
  const vrmCoreRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const baseYRef = useRef(0);
  const emotionRef = useRef(emotion);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    emotionRef.current = emotion;
  }, [emotion]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      35, // wider FOV to see full body
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 1.2, 4.5); // further back to fit full body
    camera.lookAt(0, 0.9, 0); // look around torso/neck

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.5);
    directional.position.set(5, 10, 5);
    scene.add(directional);

    const loadVRM = async () => {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      let modelUrl = VRM_URL;
      if (!import.meta.env.DEV && window.electronAPI?.getModelUrl) {
        try {
          modelUrl = await window.electronAPI.getModelUrl("avatar.vrm");
        } catch (err) {
          console.warn("Failed to resolve model URL, using public path", err);
        }
      }

      loader.load(
        modelUrl,
        (gltf) => {
          console.log("VRM loaded successfully", gltf);

          const vrmGroup = gltf.scene;

          vrmGroup.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });

          // Scale and position for better visibility
          vrmGroup.scale.set(1, 1, 1);
          vrmGroup.rotation.set(0, Math.PI, 0); // face camera, upright

          // Auto-frame full body using bounding box
          const box = new THREE.Box3().setFromObject(vrmGroup);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          vrmGroup.position.set(-center.x, -center.y, -center.z);
          baseYRef.current = -center.y;

          const height = size.y;
          const width = size.x;
          const fitHeightDistance =
            height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
          const fitWidthDistance =
            width /
            (2 *
              Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) *
              camera.aspect);
          const distance = 1.1 * Math.max(fitHeightDistance, fitWidthDistance);

          const targetY = -height * 0.1;
          camera.position.set(0, targetY + height * 0.2, distance);
          camera.near = distance / 100;
          camera.far = distance * 100;
          camera.updateProjectionMatrix();
          camera.lookAt(0, targetY, 0);

          scene.add(vrmGroup);
          vrmRef.current = vrmGroup;

          // Get expression manager from VRM core (preferred), fallback for older data
          if (gltf.userData.vrm?.expressionManager) {
            vrmCoreRef.current = gltf.userData.vrm;
            console.log("VRM Core found");
          } else if (vrmGroup.userData.vrm?.expressionManager) {
            vrmCoreRef.current = vrmGroup.userData.vrm;
            console.log("VRM Core found (fallback)");
          } else if (gltf.userData.vrmExpressionManager) {
            vrmCoreRef.current = {
              expressionManager: gltf.userData.vrmExpressionManager,
            };
            console.log("VRM Expression Manager found (fallback)");
          }

          // Debug: log available expressions
          const manager = vrmCoreRef.current?.expressionManager;
          if (manager?.expressions) {
            if (Array.isArray(manager.expressions)) {
              console.log(
                "Available expressions:",
                JSON.stringify(
                  manager.expressions
                    .map((exp) => exp?.expressionName)
                    .filter(Boolean),
                ),
              );
            } else {
              console.log(
                "Available expressions:",
                JSON.stringify(Array.from(manager.expressions.keys())),
              );
            }
          }

          setLoaded(true);
          setLoading(false);
        },
        (progress) => {
          if (progress.total) {
            console.log(
              "Loading:",
              ((progress.loaded / progress.total) * 100).toFixed(0) + "%",
            );
          }
        },
        (err) => {
          console.error("VRM Error:", err);
          setError(err.message);
          setLoading(false);
        },
      );
    };

    loadVRM();

    const animate = () => {
      const time = clockRef.current.getElapsedTime();

      if (vrmRef.current) {
        // No rotation - face camera directly
        // subtle breathing animation
        vrmRef.current.position.y =
          baseYRef.current + Math.sin(time * 1.5) * 0.01;

        // Apply emotion via VRM expression manager
        if (vrmCoreRef.current?.expressionManager) {
          const manager = vrmCoreRef.current.expressionManager;

          const setValueSafe = (name, value) => {
            if (!name) return;
            try {
              manager.setValue(name, value);
              return;
            } catch (err) {
              // Try lowercase preset names if needed
            }
            try {
              manager.setValue(String(name).toLowerCase(), value);
            } catch (err) {
              // Ignore missing expressions
            }
          };

          // Reset all expressions first
          if (typeof manager.resetValues === "function") {
            manager.resetValues();
          } else if (manager.expressions) {
            if (Array.isArray(manager.expressions)) {
              manager.expressions.forEach((exp) => {
                setValueSafe(exp?.expressionName, 0);
              });
            } else {
              Array.from(manager.expressions.keys()).forEach((name) => {
                setValueSafe(name, 0);
              });
            }
          } else {
            [
              "Happy",
              "Angry",
              "Sad",
              "Neutral",
              "Surprised",
              "Relaxed",
              "LookUp",
              "LookDown",
              "LookLeft",
              "LookRight",
              "Blink",
              "BlinkLeft",
              "BlinkRight",
            ].forEach((name) => {
              setValueSafe(name, 0);
            });
          }

          // Apply current emotion weights
          const weights = emotionWeights[emotionRef.current] || {};
          Object.entries(weights).forEach(([name, value]) => {
            setValueSafe(name, value);
          });

          manager.update();
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    const animationId = animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
          }}
        >
          Loading...
        </div>
      )}
      {error && !loading && <FallbackCharacter emotion={emotion} />}
    </div>
  );
};

const FallbackCharacter = ({ emotion }) => {
  const meshRef = useRef(null);
  const containerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
    camera.position.set(0, 0, 2.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    containerRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(2, 3, 3);
    scene.add(dir);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({
        color: emotionColors[emotion] || emotionColors.neutral,
      }),
    );
    scene.add(mesh);
    meshRef.current = mesh;

    const animate = () => {
      if (meshRef.current) {
        const t = clockRef.current.getElapsedTime();
        meshRef.current.position.y = Math.sin(t * 2) * 0.05;
        meshRef.current.material.color.set(
          emotionColors[emotion] || emotionColors.neutral,
        );
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [emotion]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default CharacterRenderer;
