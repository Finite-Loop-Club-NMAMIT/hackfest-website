import { PerspectiveCamera, Stars, useScroll } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Model } from "./model";
import { HelixCurve } from "./helix";
import { useFrame, useThree } from "@react-three/fiber";
import EventObjects from "./eventObjects";

const TimeLineScene = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  cameraRef.current?.lookAt(0, 0, 18);

  const helixCurveRef = useRef<HelixCurve>(new HelixCurve(6.5, 30, 4));

  const scroll = useScroll();

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
        curPoint.y + 1,
        curPoint.z + (radius + 3) * Math.cos(angle),
      );
      cameraRef.current.lookAt(0, curPoint.y + 1, 0);
      cameraRef.current.updateMatrix();
      cameraRef.current.updateMatrixWorld();
    }
  });

  return (
    <>
      <fog attach="fog" args={["#87CEEB", 20, 100]} />
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 20]}
        ref={cameraRef}
        fov={30}
      />

      <Model
        scale={[11, 11, 11]}
        position={[0, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {linePoints.length > 1 && <EventObjects linePoints={linePoints} />}

      <directionalLight position={[0, 0, 5]} intensity={0.7} color="white" />
      <directionalLight position={[-8, 0, -5]} intensity={0.7} color="white" />
      <ambientLight intensity={1.5} color="#ffffff" />
    </>
  );
};

export default TimeLineScene;
