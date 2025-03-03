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
  const { progress, errors, loaded, total } = useProgress();

  useEffect(() => {
    // Only update if the new progress is higher than previous max
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    console.log("progress from hero", maxProgress);
    onProgress(maxProgress, "hero");
    if (maxProgress === 100 && loaded == total) {
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
      <div className="absolute top-[65%] select-none text-center md:top-[55%]">
        <p
          style={{ textShadow: "0 0 40px #22a3ff" }}
          className="font-herkules text-[5rem] leading-none text-[#ffffff] sm:text-[8rem] md:text-[10rem] lg:text-[12rem]"
        >
          {"HACKFEST"}
        </p>
        <p
          style={{ textShadow: "0 0 15px #1df3fb" }}
          className="font-ceasar-dressing bg-[#ffffff] bg-clip-text text-3xl font-extrabold leading-none text-transparent sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
        >
          TECH OLYMPUS
        </p>
      </div>
    </main>
  );
};

export default Hero;

// drop-shadow-[0_15px_20px_rgba(147,238,256,0.8)]
