/* eslint-disable @next/next/no-html-link-for-pages */
import { useState, useEffect, useCallback, useRef } from "react";
import Domains from "~/components/domains";
import Hero from "~/components/hero";
import RootLayout from "~/components/layout";
import PrizePool from "~/components/prizePool";
import Sponsors from "~/components/sponsors";
import { BackgroundWrapper } from "~/components/layout/backgroundWrapper";
import { AboutUs } from "~/components/about2/model";
import FAQSection from "~/components/accordion";
import ProgressBar from "~/components/progressBar";
import Image from "next/image";
import AuthButton from "~/components/navbar/authButton";

export default function Home() {
  const loadedComponents = useRef(new Set());
  const [showContent, setShowContent] = useState(false);
  const [progress, setProgress] = useState({
    hero: 0,
    domain: 0,
    prizePool: 0,
  });

  const SECTION_COUNT = Object.entries(progress).length;

  const [totalProgress, setTotalProgress] = useState(0);
  const [showRegsitration, setShowRegistration] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setShowRegistration(true);
    }, 10000);

    return () => clearTimeout(timerRef.current);
  }, []);

  const handleProgress = useCallback((progress: number, component: string) => {
    setProgress((prev) => ({
      ...prev,
      [component]: progress,
    }));
  }, []);

  const handleComponentLoad = (component: string) => {
    loadedComponents.current.add(component);
    if (loadedComponents.current.size == SECTION_COUNT) {
      clearTimeout(timerRef.current);
      setShowRegistration(false);
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    const total = Object.values(progress).reduce((acc, curr) => acc + curr, 0);
    setTotalProgress(total / SECTION_COUNT);
    console.log("TOTAL progress", totalProgress);
  }, [progress]);

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
    <div>
      {showRegsitration && !showContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900">
          <AuthButton />
        </div>
      )}

      {!showContent && !showRegsitration && (
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
              <ProgressBar progress={totalProgress} />
              <span className="font-anton text-xl text-white sm:text-2xl md:text-3xl">
                {totalProgress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ visibility: showContent ? "visible" : "hidden" }}>
        <RootLayout>
          <BackgroundWrapper>
            <main className="relative mx-auto overflow-y-clip">
              <div className="relative z-10 flex flex-col gap-y-[5rem]">
                <Hero
                  onLoaded={() => handleComponentLoad("hero")}
                  onProgress={handleProgress}
                />
                <Sponsors />
                <AboutUs />
                <PrizePool
                  onLoaded={() => handleComponentLoad("prizePool")}
                  onProgress={handleProgress}
                />

                <Domains
                  onLoaded={() => handleComponentLoad("domain")}
                  onProgress={handleProgress}
                />

                <TimelineLink />

                <FAQSection />
              </div>
            </main>
          </BackgroundWrapper>
        </RootLayout>
      </div>
    </div>
  );
}

const TimelineLink = () => {
  return (
    <div className="relative flex h-[20rem] w-full animate-float flex-col items-center justify-center md:h-[28rem]">
      <a href="/timeline" className="w-[40%] md:w-[20%]">
        <Image
          src="/images/timeline_leaves.webp"
          alt="Timeline Leaves"
          layout="fill"
          objectFit="contain"
          className="absolute h-[20rem] md:h-[28rem] md:w-[30rem]"
          priority
        />

        <div className="transform rounded-md text-center font-herkules text-4xl tracking-wider transition-transform hover:scale-105 md:text-5xl">
          Explore the Timeline
        </div>
      </a>
    </div>
  );
};
