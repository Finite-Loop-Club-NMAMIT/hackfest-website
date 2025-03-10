import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Cloud,
  Clouds,
  Float,
  Text3D,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

type ModelProps = {
  scale: readonly [number, number, number];
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  textY: number;
  textSize: number;
  textPosition: readonly [number, number, number];
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
    textSize: 0.8,
    textPosition: [-4 - 1.5, -1 + 2.7, -5],
    amount: "₹50k",
    index: 1,
  },
  {
    scale: [2.5, 2.5, 2.5] as const,
    position: [0, 0, -3] as const,
    rotation: [0, 5, 0] as const,
    textY: 0.1,
    textSize: 0.8,
    textPosition: [0 - 1.5, 0 + 2.7, 0],
    amount: "₹80k",
    index: 0,
  },
  {
    scale: [2.5, 2.5, 2.5] as const,
    position: [4.5, -2, -5] as const,
    rotation: [0, 3, 0] as const,
    textY: -0.2,
    textSize: 0.8,
    textPosition: [4.5 - 1.5, -2 + 2.7, -5],
    amount: "₹30k",
    index: 2,
  },
];

const getResponsiveModels = (): ModelProps[] => {
  if (typeof window === "undefined") return models;

  const screenWidth = window.innerWidth;
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  return models.map((model) => {
    const scaleFactor = isMobile ? 0.5 : isTablet ? 0.75 : 1;

    const responsivePosition = [
      model.position[0] * scaleFactor,
      model.position[1] +
        (model.index == 2 && (isMobile || isTablet) ? 0.5 : 0),
      model.position[2] * scaleFactor,
    ] as const;

    const responsiveTextPosition = [
      // Reduced X offset for closer text placement
      responsivePosition[0] + (isMobile ? -0.8 : isTablet ? -1.1 : -1.3),
      // Keep existing Y offset
      responsivePosition[1] + (isMobile ? 2.5 : isTablet ? 2 : 2.7),
      // Keep existing Z offset
      responsivePosition[2] + (isMobile ? -2 : isTablet ? -3.5 : -5),
    ] as const;

    return {
      ...model,
      scale: isMobile
        ? ([2.2, 2.2, 2.2] as const)
        : isTablet
          ? ([1.8, 1.8, 1.8] as const)
          : model.scale,
      position: responsivePosition,
      textSize: isMobile ? 0.5 : isTablet ? 0.6 : model.textSize,
      textPosition: responsiveTextPosition,
    };
  });
};

export default function PrizePool({
  onLoaded,
  onProgress,
}: {
  onLoaded: () => void;
  onProgress: (progress: number, component: string) => void;
}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);
  const [responsiveModels, setResponsiveModels] = useState(
    getResponsiveModels(),
  );
  const [inView, setInView] = useState(false);
  const [visited, setVisited] = useState(false);

  const [maxProgress, setMaxProgress] = useState(0);
  const { progress, loaded, total } = useProgress();

  useEffect(() => {
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    const handleScroll = () => {
      if (componentRef.current) {
        const rect = componentRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        setInView(isInView);

        if (isInView) {
          // Calculate progress only when component is in view
          const componentTop = rect.top;
          const componentHeight = rect.height;
          const windowHeight = window.innerHeight;

          // Calculate how much of the component has been scrolled through
          const scrolledAmount = windowHeight - componentTop;
          const scrollProgress = scrolledAmount / componentHeight;

          // Normalize between 0 and 2
          const normalizedScroll = Math.max(0, Math.min(2, scrollProgress * 2));

          setScrollPosition(normalizedScroll);
          setVisited(true);
        } else {
          // Reset scroll position when out of view
          setScrollPosition(0);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setResponsiveModels(getResponsiveModels());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("progress from prizepool", maxProgress);
    onProgress(maxProgress, "prizePool");
    if (maxProgress === 100 && loaded == total) {
      console.log("prizepool fully loaded");
      onLoaded();
    }

    console.log(loaded, maxProgress, onLoaded, total);
  }, [loaded, maxProgress]);

  return (
    <div
      ref={componentRef}
      className="relative flex h-[90vh] w-full items-center justify-center sm:h-[150vh] sm:min-h-screen"
      id="prizes"
    >
      <h1 className="absolute top-[13%] z-[60] text-center font-herkules text-6xl tracking-wider sm:text-7xl md:top-[10%]">
        2.5L+ PrizePool
      </h1>
      <Canvas camera={{ position: [0, 2, 10] }} className="mt-40 sm:mt-0">
        <Suspense fallback={null}>
          <ambientLight intensity={2} position={[0, 1, 5]} />
          {(inView || visited) &&
            responsiveModels.map((modelProps: ModelProps) => (
              <Model
                key={modelProps.index}
                {...modelProps}
                scrollPosition={scrollPosition}
              />
            ))}
          <Clouds material={THREE.MeshBasicMaterial} frustumCulled={false}>
            <Float speed={3} floatIntensity={3} rotationIntensity={0}>
              {Array.from({ length: 4 }).map((_, ring) => {
                if (typeof window === "undefined") return;
                const screenWidth = window.innerWidth;
                const isMobile = screenWidth <= 768;
                const isTablet = screenWidth > 768 && screenWidth <= 1024;

                // Adjusted scale factors
                const scaleFactor = isMobile ? 0.8 : isTablet ? 0.6 : 1;
                const ringRadius =
                  (ring + 0.5) * (isMobile || isTablet ? 1.5 : 2) * scaleFactor;

                // Reduce cloud density on mobile
                const cloudsInRing =
                  ring === 0
                    ? 1
                    : isMobile
                      ? clouds * ring
                      : clouds * (ring + 1);

                return Array.from({ length: cloudsInRing }).map((_, index) => {
                  const angle = (index / cloudsInRing) * Math.PI * 2;
                  const x = Math.cos(angle) * ringRadius;
                  const y = isMobile ? -2.5 : isTablet ? -2.5 : -3;
                  const z = Math.sin(angle) * ringRadius - (isMobile ? 2 : 4);

                  return (
                    <Cloud
                      key={`${ring}-${index}`}
                      position={[x, y, z]}
                      bounds={[
                        isMobile ? 2 : 4,
                        isMobile ? 1 : 2,
                        isMobile ? 1 : 2,
                      ]}
                      segments={1}
                      volume={isMobile ? 2 : 3}
                      opacity={0.6}
                      color={"white"}
                      fade={isMobile ? 8 : 10}
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

const Model = ({ ...props }: Model) => {
  const {
    scale,
    position,
    rotation,
    textY,
    amount,
    index,
    scrollPosition,
    textSize,
    textPosition,
  } = props;
  const modelRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // const gltf = useLoader(GLTFLoader, "/3D/prizePoolPillar.glb", (loader) => {
  //   const dracoLoader = new DRACOLoader();
  //   dracoLoader.setDecoderPath(
  //     "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
  //   );
  //   loader.setDRACOLoader(dracoLoader);
  // });

  // const scene = useMemo(() => {
  //   return gltf.scene.clone();
  // }, [gltf]);

  const { scene: pillarScene } = useGLTF("/3D/prizePoolPillar.glb", true);
  const scene = useMemo(() => pillarScene.clone(), [pillarScene]);

  useFrame(() => {
    const yDistance = scrollPosition - 0.5;

    if (
      modelRef.current &&
      textRef.current &&
      yDistance >= 0.26 &&
      !hasAnimated
    ) {
      gsap.set(modelRef.current.position, {
        x: position[0],
        y: position[1] - 60,
        z: position[2],
      });

      gsap.set(textRef.current.position, {
        x: position[0] - 1.2,
        y: position[1] + 2.7 - 60,
        z: position[2],
      });

      gsap.to(modelRef.current.position, {
        y: position[1],
        duration: 0.6,
        delay: index * 0.3,
        ease: "power4.out",
      });

      gsap.to(textRef.current.position, {
        x: textPosition[0],
        y: textPosition[1],
        duration: 0.6,
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
        size={textSize}
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

useGLTF.preload("/3D/prizePoolPillar.glb");
