import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

const ErrorScreen = () => {
  const texture = useLoader(TextureLoader, "/logos/logo.png");

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 1, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Couldn't Load Timeline
      </Text>
      <Text
        position={[0, -1.3, 0]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Please check your connection and try again
      </Text>
    </group>
  );
};

export default ErrorScreen;
