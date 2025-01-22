import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  useCursor,
  MeshReflectorMaterial,
  Text,
  Environment,
  RenderTexture,
  PerspectiveCamera,
  Decal,
  useTexture,
  OrbitControls,
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
    position: [-3.3, 0, 1.1],
    rotation: [0, Math.PI * 0.2, 0],
  },
  {
    name: "Sustainable Development",
    image: sustainableDev,
    description: {
      p1: "Driving innovation towards a greener, more sustainable world, where technology harmonizes with the environment.",
      p2: "Hack for a better future by tackling any of the UN's 17 Sustainable Development Goals (SDGs). Think clean water, renewable energy, poverty reduction, or anything that makes our planet healthier and fairer. Build software solutions that solve real-world problems and pave the way for a sustainable tomorrow.",
    },
    prize: 10000,
    position: [-1.7, 0, 0.28],
    rotation: [0, Math.PI * 0.1, 0],
  },
  {
    name: "Healthcare",
    image: healthcare,
    description: {
      p1: "Heal through code!!! Your innovative solutions have the power to bridge gaps, save lives, and pave the way for a healthier world.",
      p2: "Develop solutions for patient care, telemedicine, health record management, or tools that enhance the overall efficiency of the healthcare system.",
    },
    prize: 10000,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  {
    name: "Logistics",
    image: logistics,
    description: {
      p1: "Redefine logistics and contribute to a world  where movement of goods is faster, smarter and also sustainable.",
      p2: "Revolutionize the way goods and services move across the globe. Tackle challenges in supply chain optimization, last-mile delivery, warehouse management, or transportation efficiency. Build solutions that streamline logistics operations, reduce environmental impact, and ensure the seamless flow of products from point A to point B. Your code can be the driving force behind a more connected and efficient global logistics network.",
    },
    prize: 10000,
    position: [1.7, 0, 0.28],
    rotation: [0, -Math.PI * 0.1, 0],
  },
  {
    name: "Open Innovation",
    image: openInnovation,
    description: {
      p1: "Innovation knows no bounds!!! Push the boundaries and Break free from traditional barriers with code.",
      p2: "This track encourages participants to work on any problem they are passionate about, fostering innovation and allowing for a wide range of projects across different domains. Solve a problem that matters to you. Identify an issue in your community or a personal challenge and develop a creative and impactful solution using technology.",
    },
    prize: null,
    position: [3.3, 0, 1.1],
    rotation: [0, -Math.PI * 0.2, 0],
  },
];

// { position: [2.15, 0, 1.5], rotation: [0, -Math.PI / 2.5, 0], url: pexel(911738) },
// { position: [2, 0, 2.75], rotation: [0, -Math.PI / 2.5, 0], url: pexel(1738986) }

const GOLDENRATIO = 1.61803398875;

const Floor = () => {
  const props = useTexture(
    {
      map: "/images/tracks/1K/marble_albedo.png",
      normalMap: "/images/tracks/1K/marble_normal.png",
      roughnessMap: "/images/tracks/1K/marble_roughness.png",
      aoMap: "/images/tracks/1K/marble_ao.png",
      metalnessMap: "/images/tracks/1K/marble_metallic.png",
    },
    (error) => {
      console.log(error);
    },
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        {...props}
        displacementScale={0.1}
        // normalScale={[0.1, 0.1]}
        roughness={0.5}
        metalness={0.7}
        envMapIntensity={1}
      />
    </mesh>
  );
};

export const Domains = () => {
  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ fov: 70, position: [0, 1, 4] }}>
        <color attach="background" args={["#191920"]} />
        <fog attach="fog" args={["#191920", 0, 45]} />
        <group position={[0, -0.5, 0]}>
          <Frames />

          <Floor />
        </group>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

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
    p.set(0, 0.6, 6.6);
    q.identity();
    if (!ref.current || !active) return;
    const object = ref.current.getObjectByName(active.name);
    clicked.current = object || null;

    if (clicked.current) {
      clicked.current?.updateWorldMatrix(true, true);
      clicked.current?.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25));
      clicked.current?.getWorldQuaternion(q);
    }
  }, [active]);

  useFrame((state, dt) => {
    easing.damp3(state.camera.position, p, 0.4, dt);
    easing.dampQ(state.camera.quaternion, q, 0.4, dt);
  });

  return (
    <group
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      onPointerMissed={() => {}}
    >
      {domains.map((domain) => (
        <Frame
          key={domain.name}
          isActive={active?.name === domain.name}
          {...domain}
          onClick={onClick}
          image={domain.image}
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
  const [hovered, hover] = useState(false);
  const texture = useLoader(THREE.TextureLoader, domain.image.src);

  useCursor(hovered);

  return (
    <group {...domain}>
      <mesh
        name={domain.name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        onClick={() => onClick(domain)}
        scale={[1.6, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}
      >
        <planeGeometry />
        <meshStandardMaterial
          color={"black"}
          metalness={0.5}
          roughness={0.5}
          map={texture}
          envMapIntensity={2}
          toneMapped={false}
        />

        {/* <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
                    <boxGeometry />
                    <meshBasicMaterial toneMapped={false} fog={false} />


                </mesh> */}

        <mesh position={[0, 0, 1]} scale={[0.9, 0.93, 0.9]}>
          <planeGeometry />
          <meshStandardMaterial
            metalness={0.5}
            roughness={0.5}
            envMapIntensity={2}
            toneMapped={false}
            map={texture}
          />
        </mesh>

        {/* <Decall rotation={[0, Math.PI, 0]}>
                    <meshStandardMaterial roughness={1} transparent polygonOffset polygonOffsetFactor={-1}>
                        <RenderTexture attach="map" >
                            <PerspectiveCamera makeDefault manual aspect={0.9 / 0.25} position={[0, 0, 5]} />
                            <color attach="background" args={['#af2040']} />
                            <ambientLight intensity={Math.PI} />
                            <directionalLight position={[10, 10, 5]} />
                            <Text rotation={[0, Math.PI, 0]} fontSize={2} color="white">
                                hello from drei
                            </Text>
                        </RenderTexture>
                    </meshStandardMaterial>
                </Decall> */}

        {/* <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={domain.image} /> */}
      </mesh>

      {/* <Text
        maxWidth={0.1}
        anchorX="left"
        anchorY="top"
        position={[0, 0, 0.4]}
        fontSize={0.025}
      >
        {domain.name.split("-").join(" ")}
      </Text> */}
    </group>
  );
}

export default Domains;
