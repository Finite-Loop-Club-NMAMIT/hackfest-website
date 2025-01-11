import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import {ZeusBackground} from "./zeusBackground";
const HeroParallax = dynamic(() => import("./HeroParallax"), { ssr: false });

const Hero: React.FC = () => {
  return (
    <main className="relative mx-auto flex w-full items-center justify-center overflow-hidden bg-[#2b2a2a]">
      {/* <HeroParallax />
       */}
       <ZeusBackground />
    </main>
  );
};

export default Hero;
