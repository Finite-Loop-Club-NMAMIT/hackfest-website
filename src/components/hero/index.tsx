import { caesarDressing } from "~/pages/_app";
import DustOverlay from "./dustOverlay";
import dynamic from "next/dynamic";
import ZeusBackground from "./zeusBackground";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
// import ZeusBust from "./zeusBust";

const ZeusBust = dynamic(() => import("./zeusBust"), { ssr: false });
// const City = dynamic(() => import("./city"), { ssr: false });

const Hero: React.FC = () => {
  return (
    <main className="relative mx-auto flex h-screen w-full  items-center justify-center overflow-hidden ">
      <Canvas>
        <Suspense fallback={null}>
          <ZeusBackground />
          <ZeusBust />
          {/* <City /> */}
          {/* <GlowingHackfest /> */}
        </Suspense>
      </Canvas>
      <DustOverlay />

      {/* <div className="absolute bottom-9 z-50 flex flex-col ">
       
        <div className="relative flex w-full justify-center">
          <span
            className={`${caesarDressing.className} absolute box-content flex w-fit select-none border bg-[#91ebfe] bg-clip-text py-4  text-3xl font-extrabold text-transparent blur-lg sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl`}
          >
            TECH OLYMPUS
          </span>
          <h1
            className={`${caesarDressing.className} relative top-0 flex h-auto w-fit select-none items-center justify-center bg-[#defeff]  bg-clip-text py-4 text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl`}
          >
            TECH OLYMPUS
          </h1>
        </div>
      </div> */}
    </main>
  );
};

export default Hero;

// drop-shadow-[0_15px_20px_rgba(147,238,256,0.8)]
