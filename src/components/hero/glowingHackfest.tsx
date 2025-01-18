import { Text3D } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";

const GlowingHackfest = () => {
  const [letterSpacing, setLetterSpacing] = useState(0.2);
  const [text, setText] = useState({
    size: 1, height: 0.1, position: new THREE.Vector3(-3.1, -2.7, 0)
  })
  const [textBorder, setTextBorder] = useState({
    size: 1.02, position: new THREE.Vector3(-3.15, -2.715, -0.1)
  })
  const [spotLights, setSpotLights] = useState([
    { position: new THREE.Vector3(8, -2, 5), intensity: 200, angle: 20 },
    { position: new THREE.Vector3(-8, -2, 5), intensity: 200, angle: 20 }
  ])

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setText({ size: 0.4, height: 0.03, position: new THREE.Vector3(-1.28, -2.7, 0) });
      setTextBorder({ size: 0.405, position: new THREE.Vector3(-1.29, -2.713, -0.1) });
      setSpotLights([
        { position: new THREE.Vector3(3, -2, 5), intensity: 20, angle: 8 },
        { position: new THREE.Vector3(-3, -2, 5), intensity: 20, angle: 8 }
      ])
      setLetterSpacing(0.08);
    } else {
      setText({ size: 1, height: 0.1, position: new THREE.Vector3(-3.1, -2.7, 0) });
      setTextBorder({ size: 1.02, position: new THREE.Vector3(-3.15, -2.715, -0.1) });
      setSpotLights([
        { position: new THREE.Vector3(8, -2, 5), intensity: 200, angle: 20 },
        { position: new THREE.Vector3(-8, -2, 5), intensity: 200, angle: 20 }
      ])
      setLetterSpacing(0.2);
    }
  })

  return (
    <div className="w-screen h-screen">
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, -2, 9], fov: 35 }}
      >
        <spotLight
          position={spotLights[0]?.position}
          intensity={spotLights[0]?.intensity}
          angle={spotLights[0]?.angle}
          color={'#4aa8ff'}
        />
        <spotLight
          position={spotLights[1]?.position}
          intensity={spotLights[1]?.intensity}
          angle={spotLights[1]?.angle}
          color={'#4aa8ff'}
        />
        <DynamicLights />

        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.7}
            luminanceSmoothing={2}
            intensity={2.5}
          />
          <ToneMapping />
        </EffectComposer>

        <Text3D
          size={text.size}
          position={text.position}
          font="/fonts/anton.json"
          bevelEnabled
          bevelSize={0.05}
          bevelThickness={0.05}
          bevelSegments={8}
          height={text.height}
          letterSpacing={letterSpacing}
        >
          {"HACKFEST"}
          <meshPhysicalMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.2}
            emissive="#0f175a"
            emissiveIntensity={1}
            clearcoat={2}
            clearcoatRoughness={1}
            reflectivity={2}
          />
        </Text3D>

        <Text3D
          size={textBorder.size}
          position={textBorder.position}
          font="/fonts/anton.json"
          bevelEnabled
          bevelSize={0.06}
          bevelThickness={0.1}
          bevelSegments={8}
          height={0.03}
          letterSpacing={letterSpacing}
        >
          {"HACKFEST"}
          <meshPhysicalMaterial
            color="#4aa8ff"
            metalness={1}
            roughness={0}
            emissive="#b6f1f7"
            emissiveIntensity={2}
            transparent={true}
            opacity={1}
            side={THREE.BackSide}
          />
        </Text3D>
      </Canvas>
    </div>
  );
};

const DynamicLights = () => {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);
  const light3 = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (light1.current) {
      light1.current.position.x = Math.sin(time) * 3;
      light1.current.position.y = Math.cos(time) * 2 - 2;
    }
    if (light2.current) {
      light2.current.position.x = Math.sin(time + Math.PI / 2) * 3;
      light2.current.position.y = Math.cos(time + Math.PI / 2) * 2 - 2;
    }
    if (light3.current) {
      light3.current.position.x = Math.sin(time + Math.PI) * 3;
      light3.current.position.y = Math.cos(time + Math.PI) * 2 - 2;
    }
  });

  return (
    <>
      <pointLight ref={light1} intensity={15} color="#4aa8ff" />
      <pointLight ref={light2} intensity={15} color="#4aa8ff" />
      <pointLight ref={light3} intensity={15} color="#ffffff" />
    </>
  );
};

export default GlowingHackfest;
