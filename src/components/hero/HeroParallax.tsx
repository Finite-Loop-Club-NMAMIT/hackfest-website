import Image from "next/image";
import HeroForeground from "~/../public/images/hero-foreground2.svg";
import HeroBackgroundSun from "~/../public/images/hero-background-sun.svg";
import HeroBackgroundNoise from "~/../public/images/hero-background-noise2.svg";
import HackfestFont from "~/../public/images/hackfest-text2.png";
import HoverBoard from "~/../public/images/hoverboard.svg";
import { type MouseEvent, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Countown from "./countdown";
import { type StaticImport } from "next/dist/shared/lib/get-img-props";

const HeroParallax = () => {
  gsap.registerPlugin(ScrollTrigger);
  const ref = useRef(null);
  const titleText = useRef(null);
  const fgRef = useRef(null);
  const gridRef = useRef(null);

  useGSAP(
    () => {
      if (titleText.current) {
        gsap.to(titleText.current, {
          y: 200,
          scale: 0.5,
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
      if (fgRef.current) {
        gsap.to(fgRef.current, {
          y: 75,
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
      if (gridRef.current) {
        gsap.to(gridRef.current, {
          y: 75,
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    },
    { scope: ref },
  );

  const boxRef = useRef(null);

  const handleMouseMove = (e: MouseEvent) => {
    const xPercentage = e.clientX / window.innerWidth - 0.5;

    if (boxRef.current) {
      (boxRef.current as HTMLDivElement).style.transform = ` translateX(${
        xPercentage * 0.175 * window.innerWidth
      }px) rotateY(${xPercentage * 15}deg) rotateZ(${-xPercentage * 10}deg)`;
    }
  };

  return (
    <div className="relative h-screen w-screen select-none" ref={ref}>
      <div
        ref={titleText}
        className="absolute inset-0 z-10 flex items-center justify-center"
      >
        <Image className={`w-[800px]`} src={HackfestFont} alt="Hackfest Font" />
      </div>

      <div className="relative -z-20 -mb-2 mt-2 h-2/3 w-screen" ref={fgRef}>
        <Image
          src={HeroForeground as StaticImport}
          alt="Hero Foreground"
          className="h-full w-full object-cover object-bottom"
        />

        {/* <Image
          src={Reflection}
          alt="Reflection"
          className="object-cover w-full mx-auto object-bottom"
        /> */}
      </div>

      <div
        className="absolute bottom-[0%] h-[50%] w-screen overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          perspective: "200px",
        }}
        ref={gridRef}
      >
        <div
          className="absolute left-[-50%] top-0 h-full w-[200%] bg-gradient-to-t from-[#060e3c] from-30% to-[#00c6af]"
          style={{ transform: "rotateX(53deg)" }}
        ></div>
        <div
          className='relative left-[-50%] h-[100%] w-[200%] bg-[url("/images/grid-sm.svg")] motion-safe:animate-move md:bg-[url("/images/grid1.svg")]'
          style={{
            backgroundRepeat: "repeat round",
            transform: "rotateX(53deg)",
          }}
        ></div>
      </div>

      <div className="absolute inset-0 -z-30">
        <Image
          src={HeroBackgroundSun as StaticImport}
          alt="Hero Background"
          className="h-screen w-screen object-cover object-top"
        />
      </div>
      {/* <div className="absolute -z-30 inset-0">
        <Image
          src={HeroBackground}
          alt="Hero Background"
          className="h-screen w-screen object-cover object-top"
        />
      </div> */}
      {/* <div className="absolute left-1/2 top-1/4 -z-[29] mx-3 w-full max-w-6xl -translate-x-1/2 md:top-24 md:mt-5">
        <div className="absolute left-1/2 -translate-x-1/2 text-[#c1f0a8] opacity-60 md:left-0 md:translate-x-0">
          <Countown />
        </div>
      </div> */}

      <div className="absolute inset-0 -z-[28]">
        <Image
          src={HeroBackgroundNoise as StaticImport}
          alt="Hero Background"
          className="h-screen w-screen object-cover object-top opacity-50"
        />
      </div>

      <div
        style={{ perspective: 600 }}
        onMouseMove={(e) => handleMouseMove(e)}
        className={`absolute inset-0 z-40 flex items-end justify-center`}
      >
        <div ref={boxRef} style={{ transformStyle: "preserve-3d" }}>
          <div className="pointer-events-none h-full w-full scale-75 sm:scale-90 md:scale-100">
            <Image
              width={200}
              height={200}
              src={HoverBoard as StaticImport}
              alt="Hover Board"
              className="fly-up-down ease-in-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroParallax;
