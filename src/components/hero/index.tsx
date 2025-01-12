import { Canvas } from "@react-three/fiber";
import { ZeusBackground } from "./zeusBackground";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import React, { Suspense, useEffect, useState } from "react";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { caesarDressing } from "~/pages/_app";
import GlowingHackfest from "./glowingHackfest";
import DustOverlay from "./dustOverlay";

const Hero: React.FC = () => {
  return (
    <main className="relative mx-auto flex w-full items-center justify-center overflow-hidden bg-[#2b2a2a]">
      <ZeusBackground />
      <DustOverlay />

      <div className="absolute z-30 h-full w-full">
        <Canvas className="flex  items-center justify-center">
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[0, 1, 5]}
            intensity={1}
            color={"#E0E0E0"}
          />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute bottom-9 z-50 flex flex-col">
        <GlowingHackfest />
        <div className="relative flex w-full justify-center">
          <span
            className={`${caesarDressing.className} absolute box-content flex w-fit select-none border bg-[#91ebfe] bg-clip-text py-4  text-3xl font-extrabold text-transparent blur-lg sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl`}
          >
            TECH OLYMPUS
          </span>
          <h1
            className={`${caesarDressing.className} relative top-0 flex h-auto w-fit select-none items-center justify-center bg-[#defeff]  bg-clip-text py-4 text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl`}
          >
            TECH OLYMPUS
          </h1>
        </div>
      </div>
    </main>
  );
};

const Model = () => {
  const gltf = useLoader(GLTFLoader, "/drcZeus.glb", (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    ); // Set the path to the Draco decoder
    loader.setDRACOLoader(dracoLoader);
  });
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

// drop-shadow-[0_15px_20px_rgba(147,238,256,0.8)]
