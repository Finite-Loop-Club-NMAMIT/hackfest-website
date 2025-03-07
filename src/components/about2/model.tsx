import React, { useEffect, useState } from "react";
import Image from "next/image";

const baseWidth = {
  sm: 640,
  md: 1100,
  lg: 1200,
};

const Slab = ({ url }: { url: string; width: number }) => {
  return (
    <div className="mt-8 grid place-content-center md:mx-4">
      <Image src={url} alt="About Us" width={1500} height={1300} />
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
    <div className="relative grid place-content-center">
      <h1 className="z-[60] w-full text-center font-herkules sm:text-7xl text-6xl tracking-wider">
        About
      </h1>
      <Slab key={config.width} url={config.url} width={config.width} />
    </div>
  );
};
