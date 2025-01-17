import { Canvas, useThree } from "@react-three/fiber";
import React, { Suspense, useEffect, useRef } from "react";
import { ScrollControls } from "@react-three/drei";
import Scene from "./scene";
// import * as THREE from "three";

const Timeline2: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollToPreviousElement = () => {
    if (ref.current) {
      const previousElement = ref.current.previousElementSibling;

      if (previousElement)
        previousElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToNextElement = () => {
    if (ref.current) {
      const nextElement = ref.current.nextElementSibling;

      if (nextElement)
        nextElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
      <div className="sticky top-0 h-screen bg-gradient-to-b from-[#392f5f] to-blue-700 pt-5 ">
        {/* Higher than Canvas z-index */}
        <button
          onClick={scrollToPreviousElement}
          className="absolute bottom-1/2 right-4 z-[51] mb-1 cursor-pointer rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-gray-500/40"
        >
          ↑
        </button>
        <button
          onClick={scrollToNextElement}
          className="absolute right-4 top-1/2 z-[51]  cursor-pointer rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-gray-500/40"
        >
          ↓
        </button>

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
    </div>
  );
};

export default Timeline2;
