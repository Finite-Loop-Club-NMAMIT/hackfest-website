import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

const baseWidth = {
  sm: 640,
  md: 1100,
  lg: 1200,
};

const Slab = ({ url, width }: { url: string; width: number }) => {
  const router = useRouter();

  return (
    <div className="relative mt-8 grid w-fit place-content-center md:mx-4">
      <Image src={url} alt="About Us" width={1500} height={1300} />
      <button
        className={`absolute ${width > baseWidth.md ? "bottom-[16%] right-[5%] h-[7%] w-[12%]" : width > baseWidth.sm ? "bottom-[11%] left-[8%] h-[5%] w-[15%]" : "bottom-[18%] right-[11%] h-[2%] w-[30%]"}`}
        onClick={async () => {
          // await downloadBrochure();
          // FIXME: Implement downloadBrochure function
          // const a = document.createElement("a");
          // a.href = "/brochure.pdf";
          // a.download = "Hackfest_Brochure.pdf";
          // a.click();
          // a.remove();
          await router.push("/brochure.pdf");
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
          url: "/images/min.webp",
        });
      } else if (window.innerWidth < baseWidth.md) {
        setConfig({
          width: baseWidth.md,
          url: "/images/mid.webp",
        });
      } else {
        setConfig({
          width: baseWidth.lg,
          url: "/images/max.webp",
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
