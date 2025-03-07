import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { ScrollControls, useProgress } from "@react-three/drei";
import Scene from "./scene";
import { log } from "three/src/nodes/TSL.js";

const Timeline = ({
  onLoaded,
  onProgress,
}: {
  onLoaded: () => void;
  onProgress: (progress: number, component: string) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [maxProgress, setMaxProgress] = useState(0);
  const { progress, loaded, total } = useProgress();

  useEffect(() => {
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    console.log("progress from timeline", maxProgress);
    onProgress(maxProgress, "timeline");
    if (maxProgress === 100 && loaded == total) {
      console.log("timeline fully loaded");
      onLoaded();
    }
  }, [maxProgress]);

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
    <div className="relative py-4 " ref={ref} id="timeline">
      <div className="relative flex w-full justify-center">
        {" "}
        <h1 className="absolute top-[10%] z-[60] font-anton text-6xl ">
          Timeline
        </h1>
      </div>

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
            dpr={[1, 1]}
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
