import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import * as THREE from "three";

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<number>(0);
  const { camera, raycaster, pointer } = useThree();

  const gltf = useLoader(GLTFLoader, url, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    loader.setDRACOLoader(dracoLoader);
  });

  useEffect(() => {
    if (gltf.animations.length && groupRef.current) {
      const newMixer = new THREE.AnimationMixer(groupRef.current);
      setMixer(newMixer);
      setAnimations(gltf.animations);

      const action = newMixer.clipAction(gltf.animations[0]!);
      action.play();

      return () => {
        newMixer.stopAllAction();
        newMixer.uncacheRoot(groupRef.current!);
      };
    }
  }, [gltf]);

  useFrame((state) => {
    if (mixer) mixer.update(state.clock.getDelta());

    if (spotlightRef.current && groupRef.current) {
      // Update raycaster with current mouse position
      raycaster.setFromCamera(pointer, camera);

      // Check intersection with the actual model
      const intersects = raycaster.intersectObject(groupRef.current, true);

      if (intersects.length > 0) {
        // Use the first intersection point
        const intersectionPoint = intersects[0]!.point;

        // Position the spotlight slightly above the intersection point
        spotlightRef.current.position.set(
          intersectionPoint.x,
          intersectionPoint.y + 0.5,
          intersectionPoint.z,
        );

        // Target the exact intersection point
        spotlightRef.current.target.position.copy(intersectionPoint);
        spotlightRef.current.target.updateMatrixWorld();
      } else {
        // If no intersection, use a fallback plane at the model's height
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const planeIntersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, planeIntersection);

        spotlightRef.current.position.set(
          planeIntersection.x,
          1,
          planeIntersection.z,
        );

        spotlightRef.current.target.position.set(
          planeIntersection.x,
          0,
          planeIntersection.z,
        );
        spotlightRef.current.target.updateMatrixWorld();
      }
    }
  });

  const playAnimation = (index: number) => {
    if (mixer && animations[index]) {
      mixer.stopAllAction();
      const action = mixer.clipAction(animations[index]);
      action.reset().play();
      setCurrentAnimation(index);
    }
  };

  return (
    <>
      <group ref={groupRef}>
        <primitive
          object={gltf.scene}
          scale={[1.5, 1.5, 1.5]}
          position={[0, 0, 0]}
          rotation={[Math.PI / 4, -Math.PI / 2, 0]}
        />
      </group>

      <spotLight
        ref={spotlightRef}
        position={[0, 0, 0]}
        angle={Math.PI}
        penumbra={0.5}
        intensity={3}
        distance={10}
        decay={1.5}
        color="#ffffff"
        castShadow
      />

      <ambientLight intensity={0.6} />
    </>
  );
}

export default function Slab() {
  return (
    <div className="relative h-screen w-screen pt-5">
      <Canvas
        camera={{
          position: [0, 5, 5],
          fov: 75,
        }}
        shadows
      >
        <React.Suspense fallback={null}>
          <Model url="/3D/glb_grid_v2.glb" />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
