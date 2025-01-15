import { Canvas, useThree } from "@react-three/fiber";
import React, { Suspense, useEffect, useRef } from "react";
import { ScrollControls } from "@react-three/drei";
import Scene from "./scene";
import * as THREE from "three";

const Timeline2: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && ref.current) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      { threshold: 0.0001 },
    );
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div className="relative" ref={ref}>
      {/* Wrapper for the entire section */}
      <div className="sticky top-0 h-screen bg-gradient-to-b from-[#392f5f] to-blue-700 pt-5">
        {/* Container for the Canvas */}
        <div className="relative h-full w-full">
          <Canvas
            id="three-canvas-container"
            className="three"
            shadows
            style={{
              height: "100% !important",
              width: "100% !important",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 50,
            }}
          >
            <Suspense fallback={null}>
              <ScrollControls pages={4} damping={0.3}>
                <Scene />
              </ScrollControls>
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* Scroll space for animation */}
      <div className="h-[300vh]" />
    </div>
  );
};

export default Timeline2;
