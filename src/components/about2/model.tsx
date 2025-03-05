import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import * as THREE from "three";

interface ModelProps {
  url: string;
}

const baseWidth = {
  sm: 640,
  md: 920,
  lg: 1000,
};

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

  // const playAnimation = (index: number) => {
  //   if (mixer && animations[index]) {
  //     mixer.stopAllAction();
  //     const action = mixer.clipAction(animations[index]);
  //     action.reset().play();
  //     setCurrentAnimation(index);
  //   }
  // };

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

      {/* <spotLight
        ref={spotlightRef}
        position={[0, 0, 0]}
        angle={Math.PI}
        penumbra={0.5}
        intensity={3}
        distance={10}
        decay={1.5}
        color="#ffffff"
        castShadow
      /> */}

      <ambientLight intensity={1} />
    </>
  );
}

const Slab = ({ fov, url }: { fov: number; url: string }) => {
  // max: fov 75 mid: fov 85 min: fov 140 h-[230vh]
  return (
    <div className="absolute mt-16  h-[230vh] w-screen pt-5 sm:mt-24 sm:h-[100vh]">
      <Canvas
        camera={{
          position: [0, 5, 5],
          fov: fov,
        }}
        shadows
      >
        <React.Suspense fallback={null}>
          <Model url={url} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export const AboutUs = ({
  onLoaded,
  onProgress,
}: {
  onLoaded: () => void;
  onProgress: (progress: number, component: string) => void;
}) => {
  const { progress, loaded, total, errors } = useProgress();

  const [maxProgress, setMaxProgress] = useState(0);

  useEffect(() => {
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    console.log("progress from about", maxProgress);
    onProgress(maxProgress, "about");
    if (maxProgress === 100 && loaded == total) {
      console.log("about fully loaded");
      onLoaded();
    }
  }, [maxProgress]);

  const [config, setConfig] = useState({
    width: baseWidth.lg,
    fov: 75,
    url: "/3D/about_compressed_max.glb",
  });

  useEffect(() => {
    const handleResize = () => {
      console.log("Window width:", window.innerWidth);

      if (window.innerWidth < baseWidth.sm) {
        setConfig({
          width: baseWidth.sm,
          fov: 140,
          url: "/3D/about_compressed_min.glb",
        });
      } else if (window.innerWidth < baseWidth.md) {
        setConfig({
          width: baseWidth.md,
          fov: 85,
          url: "/3D/about_compressed_mid.glb",
        });
      } else {
        setConfig({
          width: baseWidth.lg,
          fov: 75,
          url: "/3D/about_compressed_max.glb",
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="relative mb-12 h-[250vh] sm:mb-40 sm:h-screen ">
      <h1 className="absolute top-[0] z-[60] my-4 w-full text-center font-anton text-6xl ">
        About
      </h1>
      <Slab key={config.fov} fov={config.fov} url={config.url} />
    </div>
  );
};
