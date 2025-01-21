import dynamic from "next/dynamic";
const HeroParallax = dynamic(() => import("./HeroParallax"), { ssr: false });

const Hero: React.FC = () => {
  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center justify-center overflow-hidden">
      <HeroParallax />
    </main>
  );
};

export default Hero;
