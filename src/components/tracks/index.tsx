import React from "react";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useCursor,
  MeshReflectorMaterial,
  Text,
  Environment,
  RenderTexture,
  PerspectiveCamera,
  Image,
} from "@react-three/drei";
import { easing } from "maath";

type Domain = {
  name: string;
  image: string;
  description: {
    p1: string;
    p2: string;
  };
  prize?: number | null;
};

const GOLDENRATIO = 1.61803398875;

export default function Tracks() {
  return (
    <>
      <div className="h-screen w-screen">
        <Canvas camera={{ fov: 70, position: [0, 1, 4] }}>
          <color attach="background" args={["#0a0a1a"]} />
          <fog attach="fog" args={["#0a0a1a", 0, 15]} />
          <group position={[0, -0.5, 0]}>
            <Frames />
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[50, 50]} />
              <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={2048}
                mixBlur={1}
                mixStrength={80}
                roughness={1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#050505"
                metalness={0.5}
                mirror={0.4}
              />
            </mesh>
          </group>
          <Environment preset="city" />
        </Canvas>
      </div>
    </>
  );
}

function Frames({ q = new THREE.Quaternion(), p = new THREE.Vector3() }) {
  const ref = useRef<THREE.Group>(null);
  const clicked = useRef<THREE.Object3D | null>(null);
  const [active, setActive] = useState<Domain | null>(null);

  function onClick(domain: Domain) {
    if (!active || active.name != domain.name) {
      setActive(domain);
    } else {
      setActive(null);
    }
  }

  useEffect(() => {
    p.set(0, 0.6, 4);
    q.identity();
    if (!ref.current || !active) return;
    const object = ref.current.getObjectByName(active.name);
    clicked.current = object ?? null;

    if (clicked.current) {
      clicked.current?.updateWorldMatrix(true, true);
      clicked.current?.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25));
      clicked.current?.getWorldQuaternion(q);
    }
  }, [active, p, q]);

  useFrame((state, dt) => {
    easing.damp3(state.camera.position, p, 0.4, dt);
    easing.dampQ(state.camera.quaternion, q, 0.4, dt);
  });

  return (
    <group
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      onPointerMissed={() => setActive(null)}
    >
      {domains.map((domain) => (
        <Frame
          key={domain.name}
          isActive={active?.name === domain.name}
          {...domain}
          onClick={onClick}
        />
      ))}
    </group>
  );
}

type FrameProps = Domain & {
  isActive: boolean;
  onClick: (d: Domain) => void;
};

function Frame({ isActive, onClick, ...domain }: FrameProps) {
  const image = useRef();
  const frame = useRef<THREE.Mesh>();
  const [hovered, hover] = useState(false);
  const [rnd] = useState(() => Math.random());
  useCursor(hovered);
  useFrame((state, dt) => {
    if (image.current) {
      // Add any necessary frame updates here
    }
  });
  return (
    <group {...domain}>
      <mesh
        name={domain.name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        onClick={() => onClick(domain)}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}
      >
        <planeGeometry />
        <meshStandardMaterial
          color="#151515"
          metalness={0.5}
          roughness={0.5}
          envMapIntensity={2}
        />
        <mesh position={[0, 0, 1]} scale={[0.9, 0.93, 0.9]}>
          <planeGeometry />
          <meshStandardMaterial
            metalness={0.5}
            roughness={0.5}
            envMapIntensity={2}
            color={"red"}
          >
            <RenderTexture
              attach="map"
              center={new THREE.Vector2(0.5, 0.5)}
              rotation={0}
              flipY={false}
            >
              <PerspectiveCamera
                makeDefault
                manual
                aspect={0.9 / 0.25}
                position={[0, 0, 5]}
              />
              <color attach="background" args={["#af2040"]} />
              <ambientLight intensity={Math.PI} />
              <directionalLight position={[10, 10, 5]} />
              {isActive ? (
                <>
                  <Text rotation={[0, 0, 0]} fontSize={0.5} color="white">
                    {domain.description.p1}
                  </Text>
                  <Text
                    rotation={[0, 0, 0]}
                    fontSize={0.5}
                    color="white"
                    position={[0, -0.6, 0]}
                  >
                    {domain.description.p2}
                  </Text>
                  {domain.prize && (
                    <Text
                      rotation={[0, 0, 0]}
                      fontSize={0.5}
                      color="white"
                      position={[0, -1.2, 0]}
                    >
                      Prize: ${domain.prize}
                    </Text>
                  )}
                </>
              ) : (
                <Image url={domain.image} scale={2} />
              )}
            </RenderTexture>
          </meshStandardMaterial>
        </mesh>
      </mesh>
      <Text
        maxWidth={0.1}
        anchorX="left"
        anchorY="top"
        position={[0, 0, 0.4]}
        fontSize={0.025}
      >
        {domain.name.split("-").join(" ")}
      </Text>
    </group>
  );
}

export const domains = [
  {
    name: "Fintech",
    image: "/images/fintech.png",
    description: {
      p1: "Crafting the future of finance by creating solutions that revolutionize the way we manage, invest and transact in the financial realm.",
      p2: "Tackle challenges related to digital payments, financial inclusion, or innovative solutions for managing and investing money.",
    },
    prize: 10000,
    position: [2.15, 0, 1.5],
    rotation: [0, -Math.PI / 2.5, 0],
  },

  {
    name: "Sustainable Development",
    image: "/images/sustainableDev.png",
    description: {
      p1: "Driving innovation towards a greener, more sustainable world, where technology harmonizes with the environment.",
      p2: "Hack for a better future by tackling any of the UN's 17 Sustainable Development Goals (SDGs). Think clean water, renewable energy, poverty reduction, or anything that makes our planet healthier and fairer. Build software solutions that solve real-world problems and pave the way for a sustainable tomorrow.",
    },
    prize: 10000,
    position: [-0.8, 0, -0.6],
    rotation: [0, Math.PI / 8, 0],
  },
  {
    name: "Healthcare",
    image: "/images/healthcare.png",
    description: {
      p1: "Heal through code!!! Your innovative solutions have the power to bridge gaps, save lives, and pave the way for a healthier world.",
      p2: "Develop solutions for patient care, telemedicine, health record management, or tools that enhance the overall efficiency of the healthcare system.",
    },
    prize: 10000,
    position: [-1.75, 0, 0.25],
    rotation: [0, Math.PI / 2.5, 0],
  },
  {
    name: "Metaverse",
    image: "/images/meta.png",
    description: {
      p1: "Shape the future of immersive experiences through digital spaces that captivate and connect people in ways never thought possible.",
      p2: "Dive into the virtual realm and explore possibilities that redefine how we interact, work, and play in digital spaces. Create immersive experiences, innovative social platforms, or tools that enhance collaboration within the metaverse. Whether it's virtual reality, augmented reality, or mixed reality, unleash your creativity to shape the future of interconnected digital worlds.",
    },
    prize: 10000,
    position: [-2.15, 0, 1.5],
    rotation: [0, Math.PI / 2.5, 0],
  },
  {
    name: "Logistics",
    image: "/images/logistics.png",
    description: {
      p1: "Redefine logistics and contribute to a world  where movement of goods is faster, smarter and also sustainable.",
      p2: "Revolutionize the way goods and services move across the globe. Tackle challenges in supply chain optimization, last-mile delivery, warehouse management, or transportation efficiency. Build solutions that streamline logistics operations, reduce environmental impact, and ensure the seamless flow of products from point A to point B. Your code can be the driving force behind a more connected and efficient global logistics network.",
    },
    prize: 10000,
    position: [0.8, 0, -0.6],
    rotation: [0, -Math.PI / 8, 0],
  },
  {
    name: "Open Innovation",
    image: "/images/openInnovation.png",
    description: {
      p1: "Innovation knows no bounds!!! Push the boundaries and Break free from traditional barriers with code.",
      p2: "This track encourages participants to work on any problem they are passionate about, fostering innovation and allowing for a wide range of projects across different domains. Solve a problem that matters to you. Identify an issue in your community or a personal challenge and develop a creative and impactful solution using technology.",
    },
    prize: null,
    position: [1.75, 0, 0.25],
    rotation: [0, -Math.PI / 2.5, 0],
  },
];
