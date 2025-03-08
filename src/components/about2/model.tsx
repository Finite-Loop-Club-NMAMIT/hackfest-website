import React, { useEffect, useState } from "react";
import Image from "next/image";

const baseWidth = {
  sm: 640,
  md: 1100,
  lg: 1200,
};

const Slab = ({ url, width }: { url: string; width: number }) => {
  return (
    <div className="relative mt-8 grid w-fit place-content-center md:mx-4">
      <Image src={url} alt="About Us" width={1500} height={1300} />
      <button
        className={`absolute ${width > baseWidth.md ? "bottom-[16%] right-[4%] h-[6%] w-[12%]" : width > baseWidth.sm ? "bottom-[12%] left-[12%] h-[4%] w-[14%]" : "bottom-[18%] right-[11%] h-[2%] w-[30%]"}`}
        onClick={async () => {
          // await downloadBrochure();
          // FIXME: Implement downloadBrochure function
          const a = document.createElement("a");
          a.href = "/brochure.pdf";
          a.download = "Hackfest_Brochure.pdf";
          a.click();
          a.remove();
        }}
      ></button>
    </div>
  );
};

export const AboutUs = () => {
  const [config, setConfig] = useState({
    width: baseWidth.lg,
    url: "/images/about_us_max.webp",
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < baseWidth.sm) {
        setConfig({
          width: baseWidth.sm,
          url: "/images/about_us_min.webp",
        });
      } else if (window.innerWidth < baseWidth.md) {
        setConfig({
          width: baseWidth.md,
          url: "/images/about_us_mid.webp",
        });
      } else {
        setConfig({
          width: baseWidth.lg,
          url: "/images/about_us_max.webp",
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative grid place-content-center" id="about">
      <h1 className="z-[60] w-full text-center font-herkules text-6xl tracking-wider sm:text-7xl">
        About
      </h1>
      <Slab key={config.width} url={config.url} width={config.width} />
    </div>
  );
};
