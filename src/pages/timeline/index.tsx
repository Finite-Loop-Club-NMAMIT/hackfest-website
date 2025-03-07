import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { ScrollControls, useProgress } from "@react-three/drei";
import Image from "next/image";
import TimeLineScene from "~/components/timeline/scene";
import ProgressBar from "~/components/progressBar";
import { BackgroundWrapper } from "~/components/layout/backgroundWrapper";
import ErrorScreen from "~/components/errorScreen";

const Timeline = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [maxProgress, setMaxProgress] = useState(0);
  const { progress, loaded, total } = useProgress();

  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  useEffect(() => {
    console.log("progress from timeline", maxProgress);

    if (maxProgress === 100 && loaded == total) {
      console.log("timeline fully loaded");
      setTimeout(() => {
        setShowContent(true);
      }, 1000); // 1 second delay
    }
  }, [maxProgress, loaded, total]);

  useEffect(() => {
    if (!showContent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showContent]);

  return (
    <BackgroundWrapper>
      <div className="relative py-4" ref={ref} id="timeline">
        <div>
          {!showContent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900">
              <div className="relative flex flex-col items-center justify-center gap-2">
                <div className="relative  w-[280px] sm:w-[320px] md:w-[380px] lg:w-[400px]">
                  <Image
                    src="/logos/logo.png"
                    alt="HackFest Logo"
                    className="mx-auto w-[70%] sm:w-[75%] md:w-[80%]"
                    width={512}
                    height={512}
                  />
                </div>
                <div className="flex w-full flex-col items-center gap-2">
                  <ProgressBar progress={maxProgress} />
                  <span className="font-anton text-xl text-white sm:text-2xl md:text-3xl">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="relative flex w-full justify-center">
          {" "}
          <h1 className="absolute top-[10%] z-[60] font-anton text-6xl text-white">
            Timeline
          </h1>
        </div>

        <div className="sticky top-0 h-screen pt-5">
          <div className="relative h-full w-full">
            <Canvas
              id="three-canvas-container"
              className="three"
              shadows
              style={{
                height: "100% !important",
                width: "100% !important",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 50,
              }}
            >
              <Suspense fallback={<ErrorScreen />}>
                <ScrollControls pages={4} damping={0.3}>
                  <TimeLineScene />
                </ScrollControls>
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Timeline;
