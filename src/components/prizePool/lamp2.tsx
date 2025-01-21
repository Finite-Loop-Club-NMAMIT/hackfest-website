import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { cn } from "~/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const lamp = useRef<HTMLDivElement | null>(null);
  const light = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    gsap.fromTo(
      lamp.current,
      {
        scaleX: 0.65,
      },
      {
        scaleX: 1,
        duration: 0.8,
        ease: "easeInOut",
        delay: 0.3,
        scrollTrigger: {
          trigger: lamp.current,
          toggleActions: "play none none reset",
        },
      },
    );
    gsap.fromTo(
      light.current,
      {
        scale: 0.75,
      },
      {
        scale: 1,
        duration: 0.8,
        ease: "easeInOut",
        delay: 0.3,
        scrollTrigger: {
          trigger: light.current,
          toggleActions: "play none none reset",
        },
      },
    );
  }, [lamp, light]);

  return (
    <div
      className={cn(
        "relative z-0 flex w-full flex-col overflow-clip",
        className,
      )}
    >
      <div
        ref={light}
        className="absolute left-1/2 z-0 h-36 w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl"
      ></div>

      {/* Blue stick */}
      <div className="absolute left-1/2 top-0 z-[1] flex w-full -translate-x-1/2 justify-center">
        <div
          ref={lamp}
          className="h-0.5 w-[75vw] max-w-[30rem] bg-cyan-400"
        ></div>
      </div>

      <div className="z-5 relative flex flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};
