import React from "react";
import { anton } from "~/pages/_app";

const GlowingHackfest = () => {
  return (
    <div
      className={`${anton.className} relative text-center text-[5rem] font-black uppercase leading-none tracking-wider sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem]`}
      style={{
        textShadow: `
            0 0 5px #4aa8ff,
            0 0 15px #4aa8ff,
            0 0 25px #4aa8ff
          `,
      }}
    >
      <span className="relative z-10 text-slate-900">HACKFEST</span>

      <span
        className="absolute inset-0 z-0 animate-pulse"
        style={{
          textShadow: `
              0 0 20px #4aa8ff,
              0 0 30px #4aa8ff
            `,
        }}
      >
        HACKFEST
      </span>
    </div>
    // <span
    //   className={`{anton.className} bg-[url('/HFTexture.png')] bg-cover bg-clip-text bg-center text-center text-[5rem] font-black uppercase leading-none tracking-wider text-transparent sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem]`}
    // >
    //   HACKFEST
    // </span>
  );
};

export default GlowingHackfest;
