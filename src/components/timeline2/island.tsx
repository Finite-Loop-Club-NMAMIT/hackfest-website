import type * as THREE from "three";
import React from "react";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    mesh_0: THREE.Mesh;
  };
  materials: Record<string, never>;
};

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/3D/island.glb") as GLTFResult;
  return (
    <group {...props} dispose={null}>
      {/* <ambientLight intensity={1} color="#ffffff" />  */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={nodes.mesh_0.material}
        scale={[1.5, 1.5, 1.5]}
        rotation={[0, 0, 0]}
      />
      {props.children}
    </group>
  );
}

useGLTF.preload("/3D/island.glb");
