import React, { Suspense } from "react";
import { Canvas, ObjectMap } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export default function ZeusBust() {
  const gltf = useLoader(GLTFLoader, "/3D/zeusHF.glb", (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    loader.setDRACOLoader(dracoLoader);
  });

  const [scale, setScale] = useState([2.5, 2.5, 2.5]);
  const [rotation, setRotation] = useState([0, 0, 0]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setScale([1.5, 1.5, 1.5]);
      } else {
        setScale([2.5, 2.5, 2.5]);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const xRotation = (clientY / window.innerHeight - 0.5) * 0.2;
      const yRotation = (clientX / window.innerWidth - 0.5) * 0.2;
      setRotation([xRotation, 0 + yRotation * 10, 0]);
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
    <>
      <ambientLight intensity={2.75} position={[0, 1, 5]} />

      <Float rotationIntensity={2}>
        <primitive
          object={gltf.scene}
          scale={scale}
          position={[0, 0, 0]}
          rotation={rotation}
        />
      </Float>
    </>
  );
}
