import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  useCursor,
  Environment,
  useProgress,
  Html,
} from "@react-three/drei";
import { easing } from "maath";
import healthcare from "public/images/tracks/Healthcare.png";
import fintech from "public/images/tracks/FinTech.png";
import logistics from "public/images/tracks/Logistics.png";
import openInnovation from "public/images/tracks/OpenInnovation.png";
import sustainableDev from "public/images/tracks/SustainableDev.png";
import { type StaticImageData } from "next/image";

type Domain = {
  name: string;
  image: StaticImageData;
  description: {
    p1: string;
    p2: string;
  };
  prize?: number | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export const domains = [
  {
    name: "Fintech",
    image: fintech,
    description: {
      p1: "Crafting the future of finance by creating solutions that revolutionize the way we manage, invest and transact in the financial realm.",
      p2: "Tackle challenges related to digital payments, financial inclusion, or innovative solutions for managing and investing money.",
    },
    prize: 10000,
  },
  {
    name: "Sustainable Development",
    image: sustainableDev,
    description: {
      p1: "Driving innovation towards a greener, more sustainable world, where technology harmonizes with the environment.",
      p2: "Hack for a better future by tackling any of the UN's 17 Sustainable Development Goals (SDGs). Think clean water, renewable energy, poverty reduction, or anything that makes our planet healthier and fairer. Build software solutions that solve real-world problems and pave the way for a sustainable tomorrow.",
    },
    prize: 10000,
  },
  {
    name: "Healthcare",
    image: healthcare,
    description: {
      p1: "Heal through code!!! Your innovative solutions have the power to bridge gaps, save lives, and pave the way for a healthier world.",
      p2: "Develop solutions for patient care, telemedicine, health record management, or tools that enhance the overall efficiency of the healthcare system.",
    },
    prize: 10000,
  },
  {
    name: "Logistics",
    image: logistics,
    description: {
      p1: "Redefine logistics and contribute to a world  where movement of goods is faster, smarter and also sustainable.",
      p2: "Revolutionize the way goods and services move across the globe. Tackle challenges in supply chain optimization, last-mile delivery, warehouse management, or transportation efficiency. Build solutions that streamline logistics operations, reduce environmental impact, and ensure the seamless flow of products from point A to point B. Your code can be the driving force behind a more connected and efficient global logistics network.",
    },
    prize: 10000,
  },
  {
    name: "Open Innovation",
    image: openInnovation,
    description: {
      p1: "Innovation knows no bounds!!! Push the boundaries and Break free from traditional barriers with code.",
      p2: "This track encourages participants to work on any problem they are passionate about, fostering innovation and allowing for a wide range of projects across different domains. Solve a problem that matters to you. Identify an issue in your community or a personal challenge and develop a creative and impactful solution using technology.",
    },
    prize: null,
  },
];

const mobilePositions = [
  [0, 1.5, 0], // Center frame
  [-1.3, 3.5, 0], // Top frame
  [1.3, 3.5, 0], // Top-right frame
  [-1.3, -0.5, 0], // Bottom-left frame
  [1.3, -0.5, 0], // Bottom-right frame
];

const GOLDENRATIO = 1.61803398875;

// const Floor = () => {
//   const props = useTexture(
//     {
//       map: "/images/tracks/1K/marble_albedo.png",
//     },
//     (error) => {
//       console.log(error);
//     },
//   );

//   return (
//     <mesh rotation={[-Math.PI / 2, 0, 0]}>
//       <planeGeometry args={[50, 50]} />

//       <MeshReflectorMaterial
//         {...props}
//         blur={[0, 0]}
//         mixBlur={2}
//         mixStrength={10}
//         roughness={1}
//         depthScale={1.2}
//         minDepthThreshold={0.4}
//         maxDepthThreshold={1.4}
//         metalness={0.5}
//         mirror={0.2}
//       />
//     </mesh>
//   );
// };

export const Domains = ({
  onLoaded,
  onProgress,
}: {
  onLoaded: () => void;
  onProgress: (progress: number, component: string) => void;
}) => {
  const { progress, loaded, total } = useProgress();

  const [maxProgress, setMaxProgress] = useState(0);

  useEffect(() => {
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    console.log("progress from domains", maxProgress);
    onProgress(maxProgress, "domain");
    if (maxProgress === 100 && loaded == total) {
      console.log("domain fully loaded");
      onLoaded();
    }
  }, [maxProgress, loaded, total, onProgress, onLoaded]);

  return (
    <div className="relative h-screen w-screen" id="tracks">
      <h1 className="absolute top-[0] z-[60] w-full text-center font-herkules sm:text-7xl text-6xl tracking-wider sm:top-[5%]">
        Tracks
      </h1>
      <Canvas camera={{ fov: 70, position: [0, 1, 4] }}>
        <fog attach="fog" args={["#aaaaaa", 10, 30]} />
        <Suspense
          fallback={
            <Html center>
              <div className="text-white">
                Loading... {progress.toFixed(2)}%
              </div>
            </Html>
          }
        >
          <group position={[0, -0.5, 0]}>
            <Frames />
          </group>
        </Suspense>

        <Environment preset="city" />
        <ambientLight intensity={Math.PI * 2} />
      </Canvas>
    </div>
  );
};

function Frames({ q = new THREE.Quaternion(), p = new THREE.Vector3() }) {
  const ref = useRef<THREE.Group>(null);
  const clicked = useRef<THREE.Object3D | null>(null);
  const [active, setActive] = useState<Domain | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (active) {
        setActive(null);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [active]);

  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewport.width <= 768;
  const isTablet = viewport.width > 768 && viewport.width <= 1024;

  const cameraDistance = isMobile ? 7.3 : isTablet ? 5 : 4;
  const frameSpacing = isMobile ? 1.2 : isTablet ? 1.5 : 2;
  const frameScale = isMobile ? 1 : isTablet ? 0.9 : 1;

  //     const { viewport } = useThree();
  //   const isMobile = viewport.width < 5; // Adjusted for R3F world scale
  //   const isTablet = viewport.width >= 5 && viewport.width < 10;

  //   const cameraDistance = isMobile ? 7.3 : isTablet ? 4.2 : 4;
  //   const frameSpacing = isMobile ? 1.2 : isTablet ? 1.5 : 2;
  //   const frameScale = isMobile ? 1 : isTablet ? 0.9 : 1;

  useEffect(() => {
    if (!active) {
      p.set(0, 0.6, cameraDistance);
      q.identity();
      return;
    }

    if (!ref.current) return;
    const object = ref.current.getObjectByName(active.name);
    clicked.current = object ?? null;

    if (clicked.current) {
      clicked.current.updateWorldMatrix(true, true);
      clicked.current.localToWorld(
        p.set(0, GOLDENRATIO / 2, isMobile ? 2.5 : 1.25),
      );
      clicked.current.getWorldQuaternion(q);
    }
  }, [active, p, q, cameraDistance, isMobile]);

  useFrame((state, dt) => {
    const dampFactor = isMobile ? 0.15 : 0.25;
    easing.damp3(state.camera.position, p, dampFactor, dt);
    easing.dampQ(state.camera.quaternion, q, dampFactor, dt);
  });

  return (
    <group
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      onPointerMissed={() => setActive(null)}
      scale={frameScale}
      position={[0, isMobile ? -0.8 : 0, 0]}
    >
      {domains.map((domain, index) => (
        <Frame
          isMobile={isMobile}
          key={domain.name}
          isActive={active?.name === domain.name}
          {...domain}
          onClick={(d) => {
            if (!active || active.name !== d.name) {
              setActive(d);
            } else {
              setActive(null);
            }
          }}
          position={
            isMobile
              ? (mobilePositions[index] as [number, number, number]) // Use mobile positions if on mobile
              : [
                  (index - (domains.length - 1) / 2) * frameSpacing,
                  0,
                  Math.abs(index - (domains.length - 1) / 2) * 0.8 - 1.5,
                ]
          }
          scale={[frameScale, frameScale, frameScale]}
          rotation={
            isMobile
              ? [0, 0, 0]
              : [
                  0,
                  -((index - (domains.length - 1) / 2) * Math.PI) /
                    domains.length,
                  0,
                ]
          }
        />
      ))}

      {/* {isMobile || <Floor />} */}
    </group>
  );
}

type FrameProps = Domain & {
  isActive: boolean;
  onClick: (d: Domain) => void;
  isMobile: boolean;
};

function Frame({  onClick, ...domain }: FrameProps) {
  const [hovered, hover] = useState(false);
  const texture = useLoader(THREE.TextureLoader, domain.image.src);

  const meshRef = useRef<THREE.Mesh>(null);

  useCursor(hovered);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y +=
        Math.sin(clock.getElapsedTime() * 2) * Math.random() * 0.002;
    }
  });

  return (
    <group {...domain}>
      <mesh
        ref={meshRef}
        name={domain.name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        onClick={() => onClick(domain)}
        scale={[GOLDENRATIO, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}
      >
        <planeGeometry />
        <meshStandardMaterial
          color={"black"}
          metalness={0.5}
          roughness={0.5}
          map={texture}
          envMapIntensity={4}
          toneMapped={false}
        />

        <mesh position={[0, 0, 1]} scale={[0.9, 0.93, 0.9]}>
          <planeGeometry />
          <meshStandardMaterial
            metalness={0.5}
            roughness={0.5}
            envMapIntensity={4}
            toneMapped={false}
            map={texture}
          />
        </mesh>
      </mesh>

      {/* <Cloud seed={1} fade={30}  segments={5} volume={1} opacity={1} bounds={[0.4,0.000001, 0.4]} position={[0, -GOLDENRATIO / 2, 0]}/> */}
    </group>
  );
}

export default Domains;
