import { caesarDressing } from "~/pages/_app";
import DustOverlay from "./dustOverlay";
import dynamic from "next/dynamic";
import ZeusBackground from "./zeusBackground";
import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { useProgress, Html } from "@react-three/drei";
// import ZeusBust from "./zeusBust";

const ZeusBust = dynamic(() => import("./zeusBust"), { ssr: false });
// const City = dynamic(() => import("./city"), { ssr: false });

const Hero = ({onLoaded}:{onLoaded: ()=> void}) => {
  const { progress, loaded, total, errors } = useProgress();

 
  useEffect(() => {
    console.log('Loading Progress:', {
      progress,
      loaded,
      total,
      errors
    });
  }, [progress, loaded, total, errors]);


  useEffect(() => {
    if (progress === 100 && loaded === total && errors.length === 0) {
      console.log('Hero fully loaded');
      onLoaded();
    }
  }, [progress, loaded, total, errors, onLoaded]);

  return (
    <main className="relative mx-auto flex h-screen w-full items-center justify-center overflow-hidden">
      <Canvas>
        <Suspense fallback={
          <Html center>
            <div className="text-white">
              Loading... {progress.toFixed(2)}%
            </div>
          </Html>
        }>
          <ZeusBackground />
          <ZeusBust />
        </Suspense>
      </Canvas>
      
      {errors.length > 0 && (
        <div className="absolute bottom-4 left-4 text-red-500">
          Error loading assets
        </div>
      )}
    </main>
  );
};

export default Hero;

// drop-shadow-[0_15px_20px_rgba(147,238,256,0.8)]
