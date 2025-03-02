import dynamic from "next/dynamic";
import ZeusBackground from "./zeusBackground";
import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { useProgress, Html } from "@react-three/drei";
// import ZeusBust from "./zeusBust";

const ZeusBust = dynamic(() => import("./zeusBust"), { ssr: false });
// const City = dynamic(() => import("./city"), { ssr: false });

const Hero = ({
  onLoaded,
  onProgress,
}: {
  onLoaded: () => void;
  onProgress: (progress: number, component: string) => void;
}) => {
  const [maxProgress, setMaxProgress] = useState(0);
  const { progress, errors } = useProgress();

  useEffect(() => {
    // Only update if the new progress is higher than previous max
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    console.log("progress from hero", maxProgress);
    onProgress(maxProgress, "hero");
    if (maxProgress === 100) {
      console.log("Hero fully loaded");
      onLoaded();
    }
  }, [maxProgress]);

  return (
    <main className="relative mx-auto flex h-screen w-full items-center justify-center overflow-hidden">
      <Canvas>
        <Suspense
          fallback={
            <Html center>
              <div className="text-white">
                Loading... {progress.toFixed(2)}%
              </div>
            </Html>
          }
        >
          <ZeusBackground />
          <ZeusBust />
        </Suspense>
      </Canvas>

      {errors.length > 0 && (
        <div className="absolute bottom-4 left-4 text-red-500">
          Error loading assets
        </div>
      )}
      <div className="absolute md:top-[55%] top-[65%] text-center select-none">
        <p
          style={{ textShadow: "0 0 40px #22a3ff" }}
          className="lg:text-[12rem] md:text-[10rem] sm:text-[8rem] text-[5rem] text-[#ffffff] font-herkules leading-none"
        >
          {"HACKFEST"}
        </p>
        <p
          style={{ textShadow: "0 0 15px #1df3fb" }}
          className="bg-[#ffffff] font-ceasar-dressing bg-clip-text text-3xl font-extrabold text-transparent leading-none sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
        >
          TECH OLYMPUS
        </p>
      </div>
    </main>
  );
};

export default Hero;

// drop-shadow-[0_15px_20px_rgba(147,238,256,0.8)]
