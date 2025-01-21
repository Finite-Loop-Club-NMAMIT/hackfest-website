import { type RefObject, useEffect, useRef } from "react";
import { GiDiamonds } from "react-icons/gi";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import GridTile from "../gridTile";
import Image from "next/image";
import Cursor from "../cursor";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Button } from "../ui/button";
import styles from "./style.module.css";
import FadeIn from "../fadeInAnimation";
import { Download, MapPin } from "lucide-react";
import Link from "next/link";

const AboutHackfest = () => {
  const childRef36 = useRef<HTMLDivElement>(null);
  const childRef50 = useRef<HTMLDivElement>(null);
  const behindRef = useRef<HTMLDivElement>(null);
  const tagelinRef1 = useRef<HTMLDivElement>(null);
  const tagelinRef2 = useRef<HTMLDivElement>(null);
  const tagelinRef3 = useRef<HTMLDivElement>(null);
  const tagelinRef4 = useRef<HTMLDivElement>(null);
  const prizeParentRef = useRef<HTMLDivElement>(null);
  const prizeChildRef = useRef<HTMLDivElement>(null);

  const checkHover = (
    rect: DOMRect,
    e: MouseEvent,
    ref: RefObject<HTMLDivElement>,
  ) => {
    if (rect && ref.current) {
      if (
        rect.left < e.clientX &&
        e.clientX < rect.right &&
        rect.top < e.clientY &&
        e.clientY < rect.bottom
      ) {
        ref.current.classList.add("bg-gold");
        ref.current.classList.remove("bg-white");
      } else {
        ref.current.classList.add("bg-white");
        ref.current.classList.remove("bg-gold");
      }
    }
  };

  const handleSecondMouseMove = (e: MouseEvent) => {
    if (
      tagelinRef1.current &&
      tagelinRef2.current &&
      tagelinRef3.current &&
      tagelinRef4.current
    ) {
      const rect1 = tagelinRef1.current.getBoundingClientRect();
      checkHover(rect1, e, tagelinRef1);
      const rect2 = tagelinRef2.current.getBoundingClientRect();
      checkHover(rect2, e, tagelinRef2);
      const rect3 = tagelinRef3.current.getBoundingClientRect();
      checkHover(rect3, e, tagelinRef3);
      const rect4 = tagelinRef4.current.getBoundingClientRect();
      checkHover(rect4, e, tagelinRef4);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleSecondMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleSecondMouseMove);
    };
  });

  gsap.registerPlugin(ScrollTrigger);

  const counterAnimation = (
    childRef: RefObject<HTMLElement>,
    target: number,
    padding = 2,
    duration = 2,
    delay = 0.3,
  ) => {
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      ease: "power3.out",
      duration: duration,
      delay: delay,
      onUpdate: () => {
        if (childRef.current)
          childRef.current.innerText = `${counter.value.toFixed(0)}`.padStart(
            padding,
            "0",
          );
      },
    });
  };

  useGSAP(() => {
    gsap.timeline({
      scrollTrigger: {
        trigger: childRef36.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          counterAnimation(childRef36, 36);
        },
        onEnterBack: () => {
          counterAnimation(childRef36, 36);
        },
      },
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: childRef50.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          counterAnimation(childRef50, 50);
        },
        onEnterBack: () => {
          counterAnimation(childRef50, 50);
        },
      },
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: prizeParentRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          counterAnimation(prizeChildRef, 200000, 6);
        },
        onEnterBack: () => {
          counterAnimation(prizeChildRef, 200000, 6);
        },
      },
    });
  }, []);

  return (
    <>
      <section
        id="about"
        className={`relative mt-16 flex flex-col items-center justify-center px-2 md:px-6 md:py-10 xl:px-16 xl:py-20`}
      >
        <div
          className={`${styles.bentoGrid} grid w-full gap-2 md:gap-4 2xl:max-w-screen-2xl`}
        >
          {/* Cell 1x1 */}
          <GridTile cellType="c11" cellNo={1}>
            <FadeIn direction="right" className="h-full w-full">
              <div className="flex h-full w-full items-center justify-center gap-4">
                <div className="items-cente flex flex-col justify-center">
                  <h1 className="text-center font-obscura text-4xl font-bold tracking-wider lg:text-6xl">
                    APRIL
                  </h1>
                  <p className="flex w-full items-center justify-between text-lg font-semibold tracking-wider lg:text-2xl">
                    5th
                    <GiDiamonds />
                    6th
                    <GiDiamonds />
                    7th
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center text-xl font-semibold leading-5 max-xl:hidden">
                  <div>2</div>
                  <div>0</div>
                  <div>2</div>
                  <div>4</div>
                </div>
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c11" cellNo={2}>
            <FadeIn direction="up" delay={0.1} className="h-full w-full">
              <div className="group relative h-full w-full">
                <Image
                  src="/logos/logo.png"
                  alt="Hackfest_Logo"
                  fill
                  className="object-contain"
                />
                <div className="absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 transform bg-gradient-radial from-teal-300 to-transparent blur-xl transition-all duration-300 group-hover:brightness-125" />
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c11" cellNo={3}>
            <FadeIn direction="down" delay={0.2} className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center">
                <span className="pr-1 text-3xl font-bold md:text-4xl lg:text-5xl">
                  <div ref={childRef50} className="mr-1 inline-block">
                    50
                  </div>
                  <span className="font-obscura tracking-wider">Hrs</span>
                </span>
                <span className="justify flex items-center self-center text-base font-semibold md:text-lg lg:text-xl">
                  On-Site Event
                </span>
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c11" cellNo={4}>
            <FadeIn direction="down" delay={0.3} className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center">
                <span className="pr-1 text-3xl font-bold md:text-4xl lg:text-5xl">
                  <div ref={childRef36} className="mr-1 inline-block">
                    36
                  </div>
                  <span className="font-obscura tracking-wider">Hrs</span>
                </span>
                <span className="justify flex items-center self-center text-center text-base font-semibold md:text-lg lg:text-xl">
                  Intense Hackathon
                </span>
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c11" cellNo={5}>
            <FadeIn direction="up" delay={0.4} className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center gap-6">
                <div
                  ref={prizeParentRef}
                  className="flex w-full flex-col items-center justify-center gap-3 text-2xl xl:text-4xl"
                >
                  <div className="font-semibold">
                    &#8377;<span ref={prizeChildRef}>200000</span>+
                  </div>
                  <div>Prize Money</div>
                </div>
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c11" cellNo={6}>
            <FadeIn direction="up" className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                <Image
                  src="/logos/FLC Logo - Full.png"
                  alt="FLC_Logo"
                  width={200}
                  height={200}
                />

                <div>
                  <Link href="/about">
                    <Button className="mt-3 font-medium md:mt-5" size={"sm"}>
                      Read More
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </GridTile>

          {/* Cell 1x2 */}
          <GridTile cellType="c12" cellNo={1}>
            <FadeIn direction="right" delay={0.1} className="h-full w-full">
              <div className="flex h-full w-full items-center justify-center text-center text-xl font-semibold sm:text-2xl lg:text-4xl 2xl:text-5xl">
                <span className="pr-1 font-extrabold">3</span>
                <span className="font-obscura">Day Long Tech-Fest</span>
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c12" cellNo={2}>
            <FadeIn direction="right" delay={0.2} className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6">
                <h3 className="text-3xl font-bold lg:text-5xl">
                  <span className="pr-1 font-extrabold">6 </span>
                  <span className="font-obscura tracking-wider">Tracks</span>
                </h3>
                <p className="w-auto text-center text-base sm:text-lg lg:text-xl">
                  Six diverse tracks, to craft and code solutions for their
                  choosen problem statement.
                </p>
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c12" cellNo={3}>
            <FadeIn direction="left" delay={0.3} className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center text-base md:text-lg xl:text-2xl">
                {/* <Image
                  src="/logos/NMAMITLogo.png"
                  alt="NMAM Logo"
                  width={250}
                  height={250}
                /> */}
                <div className="flex items-center justify-center gap-2 rounded-full border border-teal-300/30 px-2 py-1 text-2xl md:text-3xl">
                  <MapPin /> Venue
                </div>
                <h1 className="mt-3">NMAM Institute of Technology, Nitte</h1>
                <p>Karkala, Udupi District, Karnataka</p>
              </div>
            </FadeIn>
          </GridTile>

          {/* Cell 2x1 */}
          <GridTile cellType="c21" cellNo={1} className="">
            <FadeIn direction="down" delay={0.4} className="h-full w-full">
              <div className="relative h-full w-full">
                <div
                  ref={behindRef}
                  className="absolute flex h-full w-full flex-col items-center justify-center gap-1 text-3xl font-bold sm:text-4xl md:gap-3 lg:text-5xl"
                >
                  <div
                    ref={tagelinRef1}
                    className="hover:bg-gradient animate-marquee bg-white bg-[length:100vw_100vw] bg-clip-text text-transparent hover:from-teal-300 xl:bg-[length:75vw_75vw]"
                  >
                    Hack
                  </div>
                  <div
                    ref={tagelinRef2}
                    className="hover:bg-gradient animate-marquee bg-white bg-[length:100vw_100vw] bg-clip-text text-transparent  hover:from-teal-300 xl:bg-[length:75vw_75vw]"
                  >
                    The
                  </div>
                  <div
                    ref={tagelinRef3}
                    className="hover:bg-gradient animate-marquee bg-white bg-[length:100vw_100vw] bg-clip-text text-transparent  hover:from-teal-300 xl:bg-[length:75vw_75vw]"
                  >
                    Time
                  </div>
                  <div
                    ref={tagelinRef4}
                    className="hover:bg-gradient animate-marquee bg-white bg-[length:100vw_100vw] bg-clip-text text-transparent  hover:from-teal-300 xl:bg-[length:75vw_75vw]"
                  >
                    Stream
                  </div>
                </div>
                <Cursor />
              </div>
            </FadeIn>
          </GridTile>

          <GridTile cellType="c21" cellNo={2} className="">
            <FadeIn direction="left" className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center">
                <div className="relative aspect-[3/4] w-2/3 xl:w-2/4 2xl:w-3/5">
                  <Image
                    className="rounded-xl object-contain"
                    src="/images/Brochure_Preview.jpeg"
                    alt="Brochure_Preview"
                    fill
                  />
                </div>
                <h4 className="mx-1 my-4 text-center text-sm md:text-base">
                  For More Information
                </h4>
                {/* <p className="text-xs text-center mx-1">
                  Brochure will be released soon!
                </p> */}
                <a href="/brochure.pdf" download="Brochure.pdf">
                  <Button className=" gap-2 text-sm font-medium md:text-base">
                    <Download /> Brochure
                  </Button>
                </a>
              </div>
            </FadeIn>
          </GridTile>

          {/* Cell 2x2 */}
          <GridTile cellType="c22" cellNo={1}>
            <FadeIn direction="right" delay={0.1} className="h-full w-full">
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 lg:p-7 xl:p-10">
                <div className="font-obscura text-3xl font-bold sm:text-4xl">
                  What is HackFest?
                </div>
                <div className="flex items-center justify-center text-justify text-sm lg:text-lg">
                  NMAM Institute of Technology presents a three-day National
                  Tech Fest featuring a 36-hour hackathon, tech conferences, and
                  networking. Our vision is to bring together 60 teams from
                  leading Indian engineering colleges, fostering innovation. The
                  event spans 50 hours, including a 36-hour hackathon, providing
                  a platform for participants to showcase their skills.
                </div>
              </div>
            </FadeIn>
          </GridTile>
        </div>
      </section>
    </>
  );
};

export default AboutHackfest;
