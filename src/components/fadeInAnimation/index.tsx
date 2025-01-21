import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";

gsap.registerPlugin(ScrollTrigger);

export default function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  div,
}: {
  children: JSX.Element;
  className?: string;
  div?: PrimitiveDivProps;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      {
        y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
        x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
        opacity: 0,
      },
      {
        y: 0,
        x: 0,
        opacity: 1,
        delay: delay,
        duration: 0.5,
        scrollTrigger: {
          trigger: ref.current,
          toggleActions: "restart none none reverse",
        },
      },
    );
  }, [ref]);
  return (
    <div className={className} ref={ref} {...div}>
      {children}
    </div>
  );
}
