import React, { useEffect, useState } from "react";
import { useGLTF, useProgress } from "@react-three/drei";
import Image from "next/image";

const baseWidth = {
  sm: 640,
  md: 1100,
  lg: 1200,
};

const Slab = ({ url }: { url: string; width: number }) => {
  return (
    <div className="grid place-content-center">
      <Image src={url} alt="About Us" width={1100} height={1300} />
    </div>
  );
};

export const AboutUs = ({
  onLoaded,
  onProgress,
}: {
  onLoaded: () => void;
  onProgress: (progress: number, component: string) => void;
}) => {
  const { progress, loaded, total, errors } = useProgress();

  const [maxProgress, setMaxProgress] = useState(0);

  useEffect(() => {
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    console.log("progress from about", maxProgress);
    onProgress(maxProgress, "about");
    if (maxProgress === 100 && loaded == total) {
      console.log("about fully loaded");
      onLoaded();
    }
  }, [maxProgress]);

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
    <div className="my-10 grid place-content-center">
      <h1 className="absolute top-[0] z-[60] my-4 w-full text-center font-anton text-6xl">
        About
      </h1>
      <Slab key={config.width} url={config.url} width={config.width} />
    </div>
  );
};


useGLTF.preload("/3D/about_compressed_max.glb");
useGLTF.preload("/3D/about_compressed_mid.glb");
useGLTF.preload("/3D/about_compressed_min.glb");