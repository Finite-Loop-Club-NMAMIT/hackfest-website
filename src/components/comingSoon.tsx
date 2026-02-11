import { BackgroundWrapper } from "~/components/layout/backgroundWrapper";
import { lagistha } from "~/pages/_app";

const ComingSoon = () => {
    return (
        <BackgroundWrapper>
            <div className="relative mx-auto flex h-screen w-full flex-col items-center justify-center overflow-hidden">
                <div className="z-10 select-none text-center">
                    <p
                        style={{ textShadow: "0 0 40px #22a3ff" }}
                        className={`${lagistha.className} text-[5rem] leading-none text-[#ffffff] sm:text-[8rem] md:text-[10rem] lg:text-[12rem]`}
                    >
                        {"Hackfest'26"}
                    </p>
                    <p
                        style={{ textShadow: "0 0 15px #1df3fb" }}
                        className="mt-4 bg-[#ffffff] bg-clip-text font-ceasar-dressing text-3xl font-extrabold leading-none text-transparent sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                    >
                        COMING SOON
                    </p>
                </div>
            </div>
        </BackgroundWrapper>
    );
};

export default ComingSoon;
