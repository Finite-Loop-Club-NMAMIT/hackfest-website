import React, { useRef } from "react";
import { cn } from "~/lib/utils";
import RootLayout from "../layout";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export default function TridentSpinner({ className, message = "is fetching your details" }: { className?: string; message?: string }) {
    const image = useRef<HTMLImageElement | null>(null);

    useGSAP(() => {
        if(image?.current){
            const tl = gsap.timeline({repeat: -1});
            tl.fromTo(image.current, {y: -100, opacity: 0}, {y: 0, opacity: 1, duration: 0.5, ease: "power1.out"})
              .to(image.current, {y: -20, duration: 0.1, ease: "power1.in"})
              .to(image.current, {y: 20, duration: 0.1, ease: "power1.out"})
              .to(image.current, {y: -10, duration: 0.1, ease: "power1.in"})
              .to(image.current, {y: 10, duration: 0.1, ease: "power1.out"})
              .to(image.current, {y: 0, duration: 0.1, ease: "power1.in"})
              .to(image.current, {y: -100, opacity: 0, duration: 0.5, ease: "power1.in"});
        }
    })

  return (
    <RootLayout>
      <div className="h-full min-h-screen w-full bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328] flex justify-center items-center">
        <div className={cn("bg-black/50 max-w-7xl m-4 flex-col sm:text-xl text-sm rounded-lg flex justify-center items-center min-h-96 w-full", className)}>
            <Image src="/images/thunderbolt.png" width={100} height={100} alt="loading" ref={image} />
            <p className="mt-6"><span className="font-bold">Iris</span>{" "}{message}</p>
        </div>
      </div>
    </RootLayout>
  );
}
