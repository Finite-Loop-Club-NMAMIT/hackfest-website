import React, { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  scale: readonly [number, number, number];
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  textY: number;
  amount: string;
};

export default function PrizePool2() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Canvas camera={{ position: [0, 2, 8] }}>
        <ambientLight intensity={2} position={[0, 1, 5]} />
        <Suspense fallback={null}>
          <Model
            scale={[4, 4, 4]}
            position={[-6, -3, -5]}
            rotation={[0, 5, 0]}
            textY={0.1}
            amount={"₹50k"}
          />
          <Model
            scale={[4, 4, 4]}
            position={[0, -2, 0]}
            rotation={[0, 5, 0]}
            textY={0.1}
            amount={"₹80k"}
          />
          <Model
            scale={[4, 4, 4]}
            position={[7, -4, -5]}
            rotation={[0, 3, 0]}
            textY={-0.2}
            amount={"₹30k"}
          />
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
        position={[position[0] - 1.5, position[1] + 4.2, position[2]]}
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
