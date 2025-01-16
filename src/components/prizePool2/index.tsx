import React, { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Cloud, Clouds, Float, Text3D } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  scale: readonly [number, number, number];
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  textY: number;
  amount: string;
};

const clouds = 4;
export default function PrizePool2() {
  return (
    <div className="flex h-[150vh] min-h-screen w-full items-center justify-center">
      <Canvas camera={{ position: [0, 2, 10] }}>
        <ambientLight intensity={2} position={[0, 1, 5]} />
        <Suspense fallback={null}>
          <Model
            scale={[2.5, 2.5, 2.5]}
            position={[-4, -1, -5]}
            rotation={[0, 5, 0]}
            textY={0.1}
            amount={"₹50k"}
          />
          <Model
            scale={[2.5, 2.5, 2.5]}
            position={[0, 0, 0]}
            rotation={[0, 5, 0]}
            textY={0.1}
            amount={"₹80k"}
          />
          <Model
            scale={[2.5, 2.5, 2.5]}
            position={[4.5, -2, -5]}
            rotation={[0, 3, 0]}
            textY={-0.2}
            amount={"₹30k"}
          />
          <Clouds material={THREE.MeshBasicMaterial} frustumCulled={false}>
            <Float speed={2} floatIntensity={3} rotationIntensity={0}>
              {[...Array(4)].map((_, ring) => {
                const ringRadius = (ring + 0.5) * 2;
                const cloudsInRing = ring === 0 ? 1 : clouds * (ring + 1);

                return [...Array(cloudsInRing)].map((_, index) => {
                  const angle = (index / cloudsInRing) * Math.PI * 2;
                  const x = Math.cos(angle) * ringRadius;
                  const y = -4;
                  const z = Math.sin(angle) * ringRadius - 6;

                  return (
                    <Cloud
                      key={`${ring}-${index}`}
                      position={[x, y, z]}
                      bounds={[4, 2, 2]}
                      segments={1}
                      volume={3}
                      opacity={0.6}
                      color="white"
                      fade={10}
                      rotation={[0, -angle, 0]}
                    />
                  );
                });
              })}
            </Float>
          </Clouds>
        </Suspense>
      </Canvas>
    </div>
  );
}

const Model = ({ scale, position, rotation, textY, amount }: Props) => {
  const gltf = useLoader(GLTFLoader, "/3D/prizePoolPillar.glb", (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    loader.setDRACOLoader(dracoLoader);
  });

  const scene = useMemo(() => {
    return gltf.scene.clone();
  }, [gltf]);

  return (
    <>
      <Text3D
        font={"/fonts/anton.json"}
        position={[position[0] - 1.5, position[1] + 2.7, position[2]]}
        rotation={new THREE.Euler(0, textY, 0)}
      >
        <meshBasicMaterial />
        {amount}
      </Text3D>
      <primitive
        object={scene}
        scale={scale}
        position={position}
        rotation={rotation}
      />
    </>
  );
};
