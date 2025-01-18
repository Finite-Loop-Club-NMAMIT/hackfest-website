import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function Model(props: JSX.IntrinsicElements["group"]) {
  const gltf = useLoader(GLTFLoader, "/3D/trident.glb", (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    loader.setDRACOLoader(dracoLoader);
  });

  const scene = useMemo(() => {
    return gltf.scene.clone();
  }, [gltf]);

  return <primitive {...props} dispose={null} object={scene} />;
}
