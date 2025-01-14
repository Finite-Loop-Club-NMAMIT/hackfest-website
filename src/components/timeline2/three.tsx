import {
  Box,
  Cloud,
  Clouds,
  Environment,
  Line,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  RoundedBox,
  Stars,
  useScroll,
} from "@react-three/drei";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Model } from "./model";
import { HelixCurve } from "./helix";
import { useFrame } from "@react-three/fiber";
import SevenBoxes from "./boxes";
// import { SceneLighting } from "./Lighting";
// import Background from "./Background";

export default function Three() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  cameraRef.current?.lookAt(0, 0, 18);

  const helixCurveRef = useRef<HelixCurve>(new HelixCurve(6.5, 30, 4));
  // const cameraGroupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // useEffect(() => {
  //   if (cameraRef.current) {
  //     cameraRef.current.position.set(0, 0, 16);
  //     cameraRef.current.rotation.set(0, 0, 0);
  //   }
  // }, []);

  useEffect(() => {
    const pointsArray: THREE.Vector3[] = [];
    const segments = 200; // Number of segments along the curve
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = helixCurveRef.current.getPoint(t);
      if (point && point instanceof THREE.Vector3) {
        pointsArray.push(point);
      }
    }
    setPoints(pointsArray);
  }, []);

  const curve = useMemo(() => {
    if (points && points.length > 1) {
      return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
    }
    return new THREE.CatmullRomCurve3([], false, "catmullrom", 0.5); // Default empty curve if points are not set
  }, [points]);

  const linePoints = useMemo(() => {
    return points.length > 0 ? curve.getPoints(30000) : [];
  }, [curve, points]);

  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 0.1);
    return shape;
  }, []);

  const easedScrollRef = useRef(0);

  useFrame((_state, delta) => {
    if (!linePoints.length) return;
    const scrollEasing = 0.92; // Adjust for different smoothing amounts
    easedScrollRef.current +=
      (scroll.offset - easedScrollRef.current) * (1 - scrollEasing);
    const curPointIndex = Math.min(
      Math.round(easedScrollRef.current * linePoints.length),
      linePoints.length - 1,
    );
    const curPoint = linePoints[curPointIndex];
    if (!curPoint || !cameraRef.current) return;
    const angle = Math.atan2(curPoint.x, curPoint.z);
    const radius = 10.5;

    // Directly set camera position without interpolation
    if (cameraRef.current) {
      cameraRef.current.position.set(
        curPoint.x + (radius + 3) * Math.sin(angle),
        curPoint.y,
        curPoint.z + (radius + 3) * Math.cos(angle),
      );
      cameraRef.current.lookAt(0, curPoint.y, 0);
      cameraRef.current.updateMatrix();
      cameraRef.current.updateMatrixWorld();
    }
  });

  return (
    <>
      {/* <OrbitControls enabled /> */}
      {/* <Background /> */}
      {/* <SceneLighting /> */}
      <fog attach="fog" args={["#87CEEB", 20, 100]} />
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 20]}
        ref={cameraRef}
        fov={30}
      />

      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      {/* <Clouds material={THREE.MeshBasicMaterial}>
        {[...Array(50)].map((_, i) => {
          const angle = (i / 50) * Math.PI * 2;
          const radius = 500 + Math.random() * 1000;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = -50 + Math.random() * 200;
          const distance = Math.sqrt(x * x + z * z);
          const scale = 8 + distance / 300;

          return (
            <Cloud
              frustumCulled={false}
              key={i}
              seed={Math.random() * 100}
              scale={scale}
              volume={12 + Math.random() * 8}
              color="b"
              fade={10}
              bounds={[
                20 + Math.random() * 40,
                8 + Math.random() * 12,
                2 + Math.random() * 10,
              ]}
              position={[x, y, z]}
              segments={2}
              opacity={0.2}
            />
          );
        })}
      </Clouds> */}

      <Model scale={[0.19, 0.3, 0.2]} position={[0, -12.5, 0]} />
      {/* {linePoints.length > 1 && (
        // <Line points={linePoints} color="white" lineWidth={16} opacity={0.8} />
        <mesh>
          <extrudeGeometry
            args={[
              shape,

              { steps: 200, bevelEnabled: false, extrudePath: curve },
            ]}
          />
          <meshBasicMaterial color="white" />
        </mesh>
      )} */}

      {linePoints.length > 1 && <SevenBoxes linePoints={linePoints} />}

      {/* <OrbitControls /> */}
      {/* <axesHelper args={[5]} /> */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 1, 5]} intensity={1} color={"#E0E0E0"} />

      {/* <spotLight position={[-5, -4, 10]} intensity={300} castShadow /> */}
      {/* <pointLight position={[-17, -10, 10]} intensity={300} castShadow />
      <pointLight position={[17, -10, 10]} intensity={300} castShadow /> */}
      {/* <Environment background>
        <mesh>
          <sphereGeometry args={[50, 100, 100]} />
          <meshBasicMaterial color="#0a1011" side={THREE.BackSide} />
        </mesh>
      </Environment> */}
    </>
  );
}
