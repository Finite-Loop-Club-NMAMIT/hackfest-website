import { useGLTF } from "@react-three/drei";

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/3D/trident.glb");

  return <primitive {...props} dispose={null} object={scene} />;
}
useGLTF.preload("/3D/trident.glb");