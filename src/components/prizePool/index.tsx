import Image from "next/image";
import Confetti from "react-dom-confetti";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { LampContainer } from "./lamp2";
import FadeIn from "../fadeInAnimation";
import { SectionHeading } from "../ui/sectionHeading";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const config = {
  angle: 290,
  spread: 300,
  startVelocity: 40,
  elementCount: 50,
  dragFriction: 0.11,
  duration: 3020,
  stagger: 3,
  width: "8px",
  height: "14px",
  perspective: "503px",
  colors: ["#f00", "#0f0", "#00f", "#FFC700", "#FF0000", "#2E3191", "#41BBC7"],
};

const PrizePool = () => {
  const ref = useRef(null);
  // useEffect(() => {
  //   if (isInView) {
  //     ConfettiExplosion();
  //   }
  // }, [isInView]);

  useGSAP(() => {
    gsap.to(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        start: "top 75%",
        onEnter: () => ConfettiExplosion(),
      },
    });
  });

  const [show, setShow] = useState(false);

  const ConfettiExplosion = () => {
    setShow(true);
    setTimeout(() => setShow(false), 1000);
  };

  const perks = [
    "Branded T-Shirts",
    "Exclusive Sticker Collection",
    "Mentorship Sessions",
    "Participation Certificates",
    "Networking Opportunities",
    "Interaction with Experts",
    "Get a chance to secure Internship at EGDK India",
    "Mini-games with Swags",
  ];

  return (
    <>
      <div
        id="prizes"
        className="z-0 flex w-full flex-col items-center justify-center gap-6 overflow-clip rounded-md py-10 md:gap-10"
      >
        <div className="mt-10 flex flex-col items-center justify-center lg:mt-0">
          <div className="flex items-center">
            <FadeIn>
              <div className="w-fit bg-gradient-to-b from-cyan-300 to-cyan-50 bg-clip-text py-4 text-center text-4xl font-black text-transparent md:text-left md:text-6xl ">
                2
              </div>
            </FadeIn>
            <SectionHeading title="L + Prize Pool" />
          </div>
          <FadeIn delay={0.3}>
            <Image
              src="/images/airship.png"
              width={180}
              height={180}
              alt="UFO"
              className="fly-up-down object-contain object-center ease-in-out"
              onClick={() => ConfettiExplosion()}
            />
          </FadeIn>

          <Confetti active={show} config={config} />
        </div>

        {/* Card Components */}

        <div
          className="z-0 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-0 md:space-x-4"
          ref={ref}
        >
          <FadeIn className="z-[1] order-2 md:order-1" delay={0.3}>
            <div className="z-10 flex h-72 w-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 pb-4 shadow-xl backdrop-blur-2xl md:translate-x-5">
              {" "}
              <h1 className="relative text-xl font-bold  text-white">
                Runner Up
              </h1>
              <p className="text-center text-base font-normal   text-slate-200 ">
                <span className="text-4xl font-bold text-white">₹30000</span>
              </p>
              <p className="text-center text-sm font-normal  text-slate-200 ">
                Goodies + Swags + Certificates + Internship Opportunities
              </p>
            </div>
          </FadeIn>
          <FadeIn className="z-[2] order-1 md:order-2">
            <div className="z-20 flex h-72 w-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 pb-4 shadow-xl backdrop-blur-2xl md:relative md:h-80 md:w-80">
              <h1 className="relative text-center text-3xl  font-bold text-white ">
                Winner
              </h1>
              <p className="text-center text-base font-normal   text-slate-200  ">
                <span className="text-4xl font-bold text-white md:text-5xl">
                  ₹50000
                </span>
              </p>
              <p className="text-center text-base font-normal  text-slate-200  ">
                Goodies + Swags + Certificates + Internship Opportunities
              </p>
            </div>
          </FadeIn>
          <FadeIn className="z-0 order-3 md:order-3" delay={0.6}>
            <div className="z-10 flex h-72 w-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 pb-4 shadow-xl backdrop-blur-2xl md:-translate-x-5">
              <h1 className="relative text-xl font-bold  text-white">
                Second Runner Up
              </h1>
              <p className="text-center text-base font-normal   text-slate-200 ">
                <span className="text-4xl font-bold text-white">₹20000</span>
              </p>
              <p className="text-center text-sm font-normal  text-slate-200 ">
                Goodies + Swags + Certificates + Internship Opportunities
              </p>
            </div>
          </FadeIn>
        </div>

        {/* <Lamp /> */}
        <LampContainer className="mt-10 pt-5 md:pt-7">
          <FadeIn>
            <h1 className="bg-gradient-to-b from-cyan-300 to-cyan-50 bg-clip-text py-4 text-center text-7xl font-semibold tracking-tight text-transparent md:text-7xl">
              ₹50K
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <h1 className="py-4 text-center text-base font-medium text-white">
              The best project in each of the 5 tracks* will be awarded with
              a cash prize of 10K
            </h1>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="mt-4 text-center text-xs font-normal text-slate-400">
              * Out of 6 tracks except Open Innovation all are eligible for this
              special prize.
            </p>
          </FadeIn>
        </LampContainer>
      </div>

      <div className="flex flex-col items-center justify-center pb-10 md:pb-16 xl:pb-20">
        <SectionHeading
          title="Perks"
          classname="text-5xl md:text-6xl xl:text-7x"
        />
        <div className="relative mx-10 mt-4 flex w-full max-w-[90vw] flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 p-5 py-5 shadow-[0_0_3px_1px_#b9b7b7ad] backdrop-blur-2xl sm:w-[40rem] md:w-[72rem] md:max-w-[90%] md:gap-5 lg:gap-7">
          {perks.map((perk, index) => (
            <div
              key={index}
              className="rounded-full border border-teal-300 px-5 py-1 text-center text-sm md:text-xl"
            >
              {perk}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PrizePool;
