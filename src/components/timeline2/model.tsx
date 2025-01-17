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
  const { nodes, materials } = useGLTF("/3D/tridentq.glb") as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <mesh
        // castShadow
        // receiveShadow
        //@ts-ignore
        geometry={nodes.Object_4.geometry}
        material={materials["Material.001"]}
        rotation={[0, Math.PI / 2, -Math.PI / 2]}
        scale={[4, 6, 6]}
        position={[0, 28, 0]}
      />
    </group>
  );
}

useGLTF.preload("/3D/tridentq.glb");
