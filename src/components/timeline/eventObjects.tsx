import { useMemo } from "react";
import * as THREE from "three";
import { Center, Text3D } from "@react-three/drei";
import { Model } from "./island";
import { events } from "~/constants/events";

type BoxProps = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

const EventObjects = ({ linePoints }: { linePoints: THREE.Vector3[] }) => {
  const boxes = useMemo(() => {
    const positions: BoxProps[] = [];
    const totalPoints = linePoints.length;

    for (let i = 0; i < 21; i++) {
      const index = Math.floor((totalPoints - 1) * (i / 20));
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

  const formatText = (index: number) => {
    const event = events[index];
    if (!event) return "";

    return [`Day ${event.day}`, event.time, event.title].join("\n");
  };

  return (
    <>
      {boxes.map((box, index) => (
        <Model key={index} position={box.position} rotation={box.rotation}>
          <group position={[1, 1.7, 0]}>
            <Text3D
              font="/fonts/cinzel.json"
              rotation={new THREE.Euler(0, -Math.PI, 0)}
              size={0.25}
              height={0.1}
              lineHeight={0.6}
              bevelEnabled
              bevelThickness={0.01}
              bevelSize={0.01}
              bevelOffset={0}
              bevelSegments={5}
            >
              {formatText(index)}
              <meshStandardMaterial
                color="white"
                metalness={0.1}
                roughness={0.2}
              />
            </Text3D>
          </group>
        </Model>
      ))}
    </>
  );
};

export default EventObjects;
