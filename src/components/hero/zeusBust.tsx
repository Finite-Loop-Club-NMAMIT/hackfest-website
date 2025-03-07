import React, { Suspense } from "react";
import { Float, useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function ZeusBust() {
  const {scene} = useGLTF("/3D/zeusHF.glb");
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
          object={scene}
          scale={scale}
          position={[0, 0, 0]}
          rotation={rotation}
        />
      </Float>
    </>
  );
}

useGLTF.preload("/3D/zeusHF.glb");