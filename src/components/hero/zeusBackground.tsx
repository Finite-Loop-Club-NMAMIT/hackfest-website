import * as THREE from "three";
import React, { useEffect, useRef } from "react";

export const ZeusBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cloudsRef = useRef<THREE.Mesh[]>([]);
  const flashRef = useRef<THREE.PointLight | null>(null);
  const boltsRef = useRef<THREE.Line[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x172554), 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0x444444, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 1);
    scene.add(directionalLight);

    const flash = new THREE.PointLight(0xb5eef9, 0, 30, 1);
    scene.add(flash);
    flashRef.current = flash;

    scene.fog = new THREE.FogExp2(0x777777, 0.001);

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    const loader = new THREE.TextureLoader();
    loader.load(
      "/cloudTexture.png",
      (texture) => {
        const cloudGeo = new THREE.PlaneGeometry(600, 800);
        const cloudMaterial = new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.2,
          depthWrite: false,
          side: THREE.DoubleSide,
          shininess: 2,
          emissive: new THREE.Color(0x222222),
          emissiveIntensity: 0.1,
        });

        for (let p = 0; p < 60; p++) {
          const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);

          cloud.position.set(
            Math.random() * 70 - 35,
            Math.random() * 15 + 11,
            Math.random() * -2 - 8,
          );

          const scale = 0.025 + Math.random() * 0.015;
          cloud.scale.set(scale, scale, 1);

          cloud.rotation.x = 0.8;
          cloud.rotation.y = -0.12;
          cloud.rotation.z = Math.random() * 2 * Math.PI;
          cloud.material.opacity = 0.6;

          cloudsRef.current.push(cloud);
          scene.add(cloud);
        }
      },
      undefined,
      (error) => console.error("Error loading cloud texture:", error),
    );

    const createLightningBolt = (length?: number, opacity?: number) => {
      const points = [];
      let x = Math.random() * 50 - 25;
      let y = Math.random() * 5 + 5;
      let z = Math.random() * -2 - 8;
      points.push(new THREE.Vector3(x, y, z));

      for (let i = 0; i < (length ?? 30); i++) {
        x += Math.random() * 0.4 - 0.2;
        y -= Math.random() * 0.6;
        z += Math.random() * 0.4 - 0.2;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xb5eef9,
        opacity: opacity ?? 0.7,
        transparent: true,
      });

      return { geometry, points, line: new THREE.Line(geometry, material) };
    };

    const triggerFlash = () => {
      if (!flashRef.current) return;

      flashRef.current.position.set(
        Math.random() * 30 - 15,
        Math.random() * 1.5 + 1.5,
        -9,
      );

      flashRef.current.intensity = 200;

      const fadeOut = () => {
        if (!flashRef.current) return;
        flashRef.current.intensity *= 0.9;
        if (flashRef.current.intensity > 1) requestAnimationFrame(fadeOut);
        else flashRef.current.intensity = 0;
      };

      requestAnimationFrame(fadeOut);

      for (let i = 0; i < 2; i++) {
        const bolt = createLightningBolt().line;
        if (bolt) {
          boltsRef.current.push(bolt);
          scene.add(bolt);

          let opacity = 0.8;
          const fadeBolt = () => {
            opacity *= 0.85; // Faster fade
            bolt.material.opacity = opacity;
            if (opacity > 0.05) {
              requestAnimationFrame(fadeBolt);
            } else {
              scene.remove(bolt);
              boltsRef.current = boltsRef.current.filter((b) => b !== bolt);
            }
          };
          setTimeout(fadeBolt, 50);
        }
      }
    };

    const createFlash = () => {
      triggerFlash();
      setTimeout(createFlash, Math.random() * 1000 + 2000);
    };
    createFlash();

    const animate = () => {
      if (!scene || !camera || !renderer) return;
      cloudsRef.current.forEach((cloud) => (cloud.rotation.z -= 0.001));
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (renderer && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
        renderer.dispose();
      }
      cloudsRef.current = [];
      boltsRef.current.forEach((bolt) => scene.remove(bolt));
      boltsRef.current = [];
      flashRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="z-0 h-screen w-screen" />;
};
