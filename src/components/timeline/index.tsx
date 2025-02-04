import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useRef } from "react";
import { ScrollControls, useProgress } from "@react-three/drei";
import Scene from "./scene";

const Timeline = ({onLoaded}:{onLoaded: ()=> void}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { progress, loaded, total, errors } = useProgress();

  // Debug progress states
  useEffect(() => {
    console.log('Timeline Loading Progress:', {
      progress,
      loaded,
      total,
      errors
    });
  }, [progress, loaded, total, errors]);

  // Only call onLoaded when everything is truly loaded
  useEffect(() => {
    if (progress === 100 && loaded === total && errors.length === 0) {
      console.log('Timeline fully loaded');
      onLoaded();
    }
  }, [progress, loaded, total, errors, onLoaded]);

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
    <div className="relative py-4" ref={ref} >
    
      <div className="sticky top-0 h-screen pt-5 ">
       
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

export default Timeline;
