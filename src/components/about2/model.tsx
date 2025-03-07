import React, { useEffect, useState } from "react";
import { useGLTF, useProgress } from "@react-three/drei";
import Image from "next/image";

const baseWidth = {
  sm: 640,
  md: 1100,
  lg: 1200,
};

const Slab = ({ url, width }: { url: string; width: number }) => {
  return width === baseWidth.sm ? (
    <div className="relative mt-28 h-[150vh] w-[140vw]">
      <Image src={url} alt="About Us" fill />
    </div>
  ) : (
    <div className="mt-28 grid place-content-center">
      <Image src={url} alt="About Us" width={1200} height={1400} />
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
      console.log("Window width:", window.innerWidth);

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
    <div className="relative my-10 mt-40 grid place-content-center">
      <h1 className="absolute top-[0] z-[60] my-4 w-full text-center font-anton text-6xl">
        About
      </h1>
      <Slab key={config.width} url={config.url} width={config.width} />
    </div>
  );
};

// useGLTF.preload("/3D/about_compressed_max.glb");
// useGLTF.preload("/3D/about_compressed_mid.glb");
// useGLTF.preload("/3D/about_compressed_min.glb");
