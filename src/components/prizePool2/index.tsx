import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Cloud, Clouds, Float, Text3D } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

type ModelProps = {
  scale: readonly [number, number, number];
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  textY: number;
  amount: string;
  index: number;
};

type Model = ModelProps & {
  scrollPosition: number;
};

const clouds = 4;

const models: ModelProps[] = [
  {
    scale: [2.5, 2.5, 2.5] as const,
    position: [-4, -1, -5] as const,
    rotation: [0, 5, 0] as const,
    textY: 0.1,
    amount: "₹50k",
    index: 1,
  },
  {
    scale: [2.5, 2.5, 2.5] as const,
    position: [0, 0, 0] as const,
    rotation: [0, 5, 0] as const,
    textY: 0.1,
    amount: "₹80k",
    index: 0,
  },
  {
    scale: [2.5, 2.5, 2.5] as const,
    position: [4.5, -2, -5] as const,
    rotation: [0, 3, 0] as const,
    textY: -0.2,
    amount: "₹30k",
    index: 2,
  },
];

export default function PrizePool2() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (componentRef.current) {
        const scrolled = window.scrollY;
        const componentHeight = componentRef.current.scrollHeight;
        const windowHeight = window.innerHeight;

        const rawScrollPercentage = scrolled / (componentHeight - windowHeight);

        // Clamp the value between 0 and 2
        const normalizedScroll = Math.max(0, Math.min(2, rawScrollPercentage));

        setScrollPosition(normalizedScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={componentRef}
      className="flex h-[150vh] min-h-screen w-full items-center justify-center"
    >
      <Canvas camera={{ position: [0, 2, 10] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={2} position={[0, 1, 5]} />
          {models.map((modelProps) => (
            <Model
              key={modelProps.index}
              {...modelProps}
              scrollPosition={scrollPosition}
            />
          ))}
          <Clouds material={THREE.MeshBasicMaterial} frustumCulled={false}>
            <Float speed={3} floatIntensity={3} rotationIntensity={0}>
              {[...Array(4)].map((_, ring) => {
                const ringRadius = (ring + 0.5) * 2;
                const cloudsInRing = ring === 0 ? 1 : clouds * (ring + 1);

                return [...Array(cloudsInRing)].map((_, index) => {
                  const angle = (index / cloudsInRing) * Math.PI * 2;
                  const x = Math.cos(angle) * ringRadius;
                  const y = -3;
                  const z = Math.sin(angle) * ringRadius - 4;

                  return (
                    <Cloud
                      key={`${ring}-${index}`}
                      position={[x, y, z]}
                      bounds={[4, 2, 2]}
                      segments={1}
                      volume={3}
                      opacity={0.6}
                      color={"white"}
                      fade={10}
                      rotation={[0, -angle, 0]}
                    />
                  );
                });
              })}
              <Cloud
                position={[0, -4, 1]}
                bounds={[4, 2, 2]}
                segments={1}
                volume={3}
                opacity={0.4}
                color="white"
                fade={10}
                rotation={[0, 0, 0]}
              />
              <Cloud
                position={[0, -3, 2]}
                bounds={[4, 2, 2]}
                segments={1}
                volume={3}
                opacity={0.4}
                color="white"
                fade={10}
                rotation={[0, 0, 0]}
              />
              <Cloud
                position={[0, -3, 2]}
                bounds={[4, 2, 2]}
                segments={1}
                volume={3}
                opacity={0.4}
                color="white"
                fade={10}
                rotation={[0, 0, 0]}
              />
              <Cloud
                position={[-1, -3, 2]}
                bounds={[4, 2, 2]}
                segments={1}
                volume={3}
                opacity={0.4}
                color="white"
                fade={10}
                rotation={[0, 0, 0]}
              />
            </Float>
          </Clouds>
        </Suspense>
      </Canvas>
    </div>
  );
}

const Model = ({
  scale,
  position,
  rotation,
  textY,
  amount,
  index,
  scrollPosition,
}: Model) => {
  const modelRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

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

  useFrame(() => {
    const yDistance = Math.abs(scrollPosition - 0.5);

    if (
      modelRef.current &&
      textRef.current &&
      yDistance >= 0.8 &&
      !hasAnimated
    ) {
      gsap.set(modelRef.current.position, {
        x: position[0],
        y: position[1] - 60,
        z: position[2],
      });

      gsap.set(textRef.current.position, {
        x: position[0] - 1.5,
        y: position[1] + 2.7 - 60,
        z: position[2],
      });

      gsap.to(modelRef.current.position, {
        y: position[1],
        duration: 1.0,
        delay: index * 0.3,
        ease: "power4.out",
      });

      gsap.to(textRef.current.position, {
        y: position[1] + 2.7,
        duration: 1.0,
        delay: index * 0.3,
        ease: "power4.out",
      });

      setHasAnimated(true);
    }
  });

  return (
    <>
      <Text3D
        ref={textRef}
        font={"/fonts/anton.json"}
        position={[position[0] - 1.5, position[1] - 60 + 2.7, position[2]]}
        rotation={new THREE.Euler(0, textY, 0)}
      >
        <meshBasicMaterial />
        {amount}
      </Text3D>
      <primitive
        object={scene}
        ref={modelRef}
        scale={scale}
        position={[position[0], position[1] - 60, position[2]]}
        rotation={rotation}
      />
    </>
  );
};
