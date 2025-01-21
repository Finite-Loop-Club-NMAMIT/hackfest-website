import Image from "next/image";
import Tilt from "react-parallax-tilt";

export const SponsorsTile: React.FC<{
  src: string;
  backcolor?: "gold" | "silver" | "bronze" | "platinum" | "diamond";
  alt?: string;
}> = ({ src, backcolor = "bronze", alt = "" }) => {
  return (
    <Tilt
      tiltReverse={true}
      perspective={1000}
      scale={1.1}
      glareEnable={true}
      glareBorderRadius="1.5rem"
      glareMaxOpacity={0.3}
      glarePosition="all"
      style={{ transformStyle: "preserve-3d" }}
      className={backcolor === "diamond" ? "[&>.glare-wrapper]:rotate-45" : ""}
    >
      <div
        className={`group rounded-3xl border-2 bg-black p-5 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]
                ${
                  backcolor === "gold"
                    ? "border-[#ffdf00] shadow-[#ffdf00]"
                    : ""
                }
                ${
                  backcolor === "silver"
                    ? "border-[#c0c0c0] shadow-[#c0c0c0]"
                    : ""
                }
                ${
                  backcolor === "bronze"
                    ? "border-[#CD7F32] shadow-[#CD7F32]"
                    : ""
                }
                ${
                  backcolor === "platinum"
                    ? "border-[#E5E4E2] shadow-[#E5E4E2]"
                    : ""
                }
                ${
                  backcolor === "diamond"
                    ? "rotate-45 border-[#B9F2FF] shadow-[#B9F2FF] transition-transform"
                    : ""
                }
                `}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className={`absolute m-auto -mx-5 h-full w-full select-none text-center text-[28px] uppercase opacity-0 transition-opacity duration-700 group-hover:opacity-100
                        ${backcolor === "platinum" ? "text-[#E5E4E2]" : ""}
                        ${backcolor === "gold" ? "text-[#ffdf00]" : ""}
                        ${backcolor === "silver" ? "text-[#c0c0c0]" : ""}
                        ${backcolor === "bronze" ? "text-[#CD7F32]" : ""}
                        ${
                          backcolor === "diamond"
                            ? "-translate-x-5 -translate-y-10 -rotate-45 text-[#B9F2FF] duration-700 text-shadow-[0_4px_4px_rgb(0,69,71)]"
                            : ""
                        }`}
        >
          {backcolor === "diamond" ? (
            "DIAMOND"
          ) : backcolor === "platinum" ? (
            "PLATIUM"
          ) : backcolor === "gold" ? (
            "GOLD"
          ) : backcolor === "silver" ? (
            "SILVER"
          ) : backcolor === "bronze" ? (
            "BRONZE"
          ) : (
            <></>
          )}
          {/* <br></br>
                            TIER */}
        </div>
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className={`h-[80px] w-[80px] select-none rounded-lg transition-transform duration-1000 group-hover:translate-y-10 group-hover:translate-z-20 ${
            backcolor === "diamond"
              ? "translate-y-[0px_!important] -rotate-45"
              : ""
          }`}
        ></Image>
      </div>
    </Tilt>
  );
};
