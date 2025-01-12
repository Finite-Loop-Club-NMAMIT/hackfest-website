import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { ZeusBackground } from "./zeusBackground";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import React, { Suspense, useEffect, useState } from "react";

const HeroParallax = dynamic(() => import("./HeroParallax"), { ssr: false });

const Hero: React.FC = () => {
  return (
    <main className="relative mx-auto flex w-full items-center justify-center overflow-hidden bg-[#2b2a2a]">
      {/* <HeroParallax />
       */}
      <ZeusBackground />

      <div className="absolute z-50 h-full w-full ">
        <Canvas className="flex  items-center justify-center">
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 1, 5]} intensity={1} />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        </Canvas>
      </div>
    </main>
  );
};

const Model = () => {
  const gltf = useLoader(GLTFLoader, "/scaledZeus.glb");
  const [scale, setScale] = useState([3.5, 3.5, 3.5]);
  const [modelPos, setModelPos] = useState([0, -4, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setScale([2.5, 2.5, 2.5]);
        setModelPos([-0.2, -3, 0]);
      } else {
        setScale([3.5, 3.5, 3.5]);
        setModelPos([0, -4, 0]);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const xRotation = (clientY / window.innerHeight - 0.5) * 0.2;
      const yRotation = (clientX / window.innerWidth - 0.5) * 0.2;
      setRotation([xRotation, 0 + yRotation, 0]);
      setModelPos([yRotation, -4 + xRotation, 0]);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <primitive
      object={gltf.scene}
      scale={scale}
      position={modelPos}
      rotation={rotation}
    />
  );
};

export default Hero;
