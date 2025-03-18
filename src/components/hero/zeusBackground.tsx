import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  type PointLight,
} from "three";
import { useTexture } from "@react-three/drei";

interface CloudProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

interface BoltProps {
  points: Vector3[];
  opacity: number;
  id: number;
}

function Scene() {
  const width =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const cloudTexture = useTexture("/textures/cloudTexture.png");
  const flashRef = useRef<PointLight>(null);
  const [clouds, setClouds] = useState<CloudProps[]>([]);
  const [bolts, setBolts] = useState<BoltProps[]>([]);

  useEffect(() => {
    const newClouds: CloudProps[] = Array.from(
      { length: width ? 20 : 60 },
      () => ({
        position: [
          Math.random() * 70 - 35,
          Math.random() * 15 + 11,
          Math.random() * -2 - 8,
        ],
        rotation: [0.8, -0.12, Math.random() * 2 * Math.PI],
        scale: 0.025 + Math.random() * 0.015,
      }),
    );
    setClouds(newClouds);
  }, [width]);

  const createLightningBolt = useCallback((): BoltProps => {
    const points: Vector3[] = [];
    let x = Math.random() * (width ? 125 : 50) - (width ? 12.5 : 25);
    let y = Math.random() * 5 + 5;
    let z = Math.random() * -2 - 8;

    for (let i = 0; i < (width ? 20 : 30); i++) {
      points.push(new Vector3(x, y, z));
      x += Math.random() * 0.4 - 0.2;
      y -= Math.random() * 0.6;
      z += Math.random() * 0.4 - 0.2;
    }

    return { points, opacity: 0.8, id: Math.random() };
  }, [width]);

  const triggerFlash = useCallback((): void => {
    if (!flashRef.current) return;

    flashRef.current.intensity = 200;
    const newBolts = Array.from({ length: width ? 1 : 2 }, () =>
      createLightningBolt(),
    );
    setBolts((prev) => [...prev, ...newBolts]);

    setTimeout(() => {
      setBolts((prev) => prev.filter((bolt) => bolt.opacity > 0.05));
    }, 500);
  }, [width, createLightningBolt]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        triggerFlash();
      },
      Math.random() * 1000 + 2000,
    );

    return () => clearInterval(interval);
  }, [triggerFlash]);

  useFrame((state, delta) => {
    if (flashRef.current) {
      flashRef.current.intensity *= 0.9;
    }

    setBolts((prev) =>
      prev.map((bolt) => ({
        ...bolt,
        opacity: bolt.opacity * 0.85,
      })),
    );

    setClouds((prev) =>
      prev.map((cloud) => ({
        ...cloud,
        rotation: [
          cloud.rotation[0],
          cloud.rotation[1],
          cloud.rotation[2] + delta * 0.05,
        ],
      })),
    );
  });

  return (
    <>
      <fog attach="fog" args={[0x777777, 0.001]} />

      {clouds.map((cloud, i) => (
        <mesh
          key={i}
          position={cloud.position}
          rotation={cloud.rotation}
          scale={cloud.scale}
        >
          <planeGeometry args={[600, 800]} />
          <meshPhongMaterial
            map={cloudTexture}
            transparent
            opacity={0.7}
            color={0x888888}
            alphaTest={0.1}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}

      {bolts.map((bolt) => {
        const geometry = new BufferGeometry().setFromPoints(bolt.points);
        const material = new LineBasicMaterial({
          color: 0xb5eef9,
          opacity: bolt.opacity,
          transparent: true,
        });
        return (
          <primitive key={bolt.id} object={new Line(geometry, material)} />
        );
      })}
    </>
  );
}

const ZeusBackground = () => {
  return (
    <>
      <Scene />
    </>
  );
};

export default ZeusBackground;
