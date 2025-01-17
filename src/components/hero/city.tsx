import { Canvas, useLoader } from "@react-three/fiber"
import { Suspense, useEffect, useMemo, useState } from "react";
import { DRACOLoader, GLTFLoader } from "three-stdlib";
import * as THREE from "three";

export default function City() {
  const [spotLights, setSpotLights] = useState([
    { position: new THREE.Vector3(22, 0, -1), intensity: 220 },
    { position: new THREE.Vector3(-22, 0, -1), intensity: 220 }
  ])

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSpotLights([
        { position: new THREE.Vector3(10, 0, -1), intensity: 80 },
        { position: new THREE.Vector3(-10, 0, -1), intensity: 80 }
      ])
    } else {
      setSpotLights([
        { position: new THREE.Vector3(22, 0, -1), intensity: 220 },
        { position: new THREE.Vector3(-22, 0, -1), intensity: 220 }
      ])
    }
  })

  return (
    <div className="absolute z-20 h-full w-full">
      <Canvas
        className="flex  items-center justify-center"
        camera={{
          position: [0, 0, 5]
        }}
      >
        <ambientLight intensity={10} position={[0, -3, 5]} />
        <spotLight
          intensity={spotLights[0]?.intensity}
          position={spotLights[0]?.position}
          castShadow={true}
          penumbra={0.6}
        />
        <spotLight
          intensity={spotLights[1]?.intensity}
          position={spotLights[1]?.position}
          castShadow={true}
          penumbra={0.6}
        />

        <Suspense fallback={<>Hello</>}>
            <Model />
        </Suspense>
      </Canvas>
    </div>
  );
}

const Model = () => {
    const gltf = useLoader(GLTFLoader, "/3D/land.glb", (loader) => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(
            "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
        );
        loader.setDRACOLoader(dracoLoader);
    })

    const [scale, setScale] = useState([2.5, 2.5, 2.5]);
    const [tiles, setTiles] = useState(10);

    useEffect(() => {

        const handleResize = () => {
          if (window.innerWidth <= 768) {
            setTiles(4);
            setScale([1.5, 1.5, 1.5]);
          } else {
            setTiles(10);
            setScale([2.5, 2.5, 2.5]);
          }
        };
    
    
        window.addEventListener("resize", handleResize);
        handleResize();
    
        return () => {
          window.removeEventListener("resize", handleResize);
        };
    }, []);

    const scenes = useMemo(() => {
      const scenes = [];
      const gridSize = tiles;
  
      for (let z = -gridSize; z <= 0; z++) {
        const clonedScene = gltf.scene.clone(true);
        scenes.push({
          scene: clonedScene,
          position: [0, (window.innerWidth <= 768 ? -3 : -2), z*(window.innerWidth <= 768 ? 2.5 : 4.5)],
        });
      }

      return scenes;
    }, [gltf.scene]);

    return (
      <>
        {scenes.map((item, index) => (
          <primitive
            object={item.scene}
            scale={scale}
            position={item.position}
            rotation={[9.4, 0, 0]}
            key={index}
          />
        ))
      }
      </>
    );
}