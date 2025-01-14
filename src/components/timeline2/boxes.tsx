import { useMemo } from "react";
import * as THREE from "three";
import { Cloud, Clouds, Text3D } from "@react-three/drei";

type BoxProps = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

const CloudBoxes = ({ linePoints }: { linePoints: THREE.Vector3[] }) => {
  const boxes = useMemo(() => {
    const positions: BoxProps[] = [];
    const totalPoints = linePoints.length;

    for (let i = 0; i < 20; i++) {
      const index = Math.floor((totalPoints - 1) * (i / 19));
      const point = linePoints[index];

      if (point) {
        positions.push({
          position: point,
          rotation: new THREE.Euler(
            0,
            Math.atan2(point.x, point.z) + Math.PI,
            0,
          ),
        });
      }
    }

    return positions;
  }, [linePoints]);

  return (
    <Clouds material={THREE.MeshStandardMaterial} frustumCulled={false}>
      {boxes.map((box, index) => (
        <Cloud
          key={index}
          segments={1}
          bounds={[8, 3, 0.1]}
          position={box.position}
          rotation={box.rotation}
          volume={9}
          opacity={0.85}
          color="white"
          concentrate="outside"
          speed={0}
          fade={1}
          frustumCulled={false}
          seed={10}
        >
          <Text3D
            font={"/fonts/puffy.json"}
            rotation={new THREE.Euler(0, -Math.PI, 0)}
            size={0.5}
            position={[1.5, -0.25, 0]}
          >
            <meshBasicMaterial
              color="#ff0000"
              // metalness={0.5}
              // roughness={0.2}
            />
            Hello world!
          </Text3D>
        </Cloud>
      ))}
    </Clouds>
  );
};

export default CloudBoxes;
