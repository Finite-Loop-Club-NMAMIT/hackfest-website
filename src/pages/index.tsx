import { useState, useEffect, useCallback, useRef } from "react";
import Domains from "~/components/domains";
import Hero from "~/components/hero";
import RootLayout from "~/components/layout";
import PrizePool from "~/components/prizePool";
import Sponsors from "~/components/sponsors";
import Timeline from "~/components/timeline";
import { BackgroundWrapper } from "~/components/layout/backgroundWrapper";

import { AboutUs } from "~/components/about2/model";
import FAQSection from "~/components/accordion";
import ProgressBar from "~/components/progressBar";


export default function Home() {
  const [componentsLoaded, setComponentsLoaded] = useState({
    hero: false,
    prizePool: false,
    timeline: false,
    domain: false,
    about: false,
  });

  const loadedComponents = useRef(new Set());
  const [showContent, setShowContent] = useState(false);
  const [progress, setProgress] = useState({
    domain: 0,
    hero: 0,
    prizePool: 0,
    timeline: 0,
    about: 0,
  });

  const [totalProgress, setTotalProgress] = useState(0);

  const handleProgress = useCallback((progress: number, component: string) => {
    setProgress((prev) => ({
      ...prev,
      [component]: progress,
    }));
  }, []);

  const handleComponentLoad = useCallback(
    (component: keyof typeof componentsLoaded) => {
      if (!loadedComponents.current.has(component)) {
        loadedComponents.current.add(component);
        setComponentsLoaded((prev) => ({
          ...prev,
          [component]: true,
        }));
      }
    },
    [],
  );

  const allLoaded = Object.values(componentsLoaded).every(Boolean);

  useEffect(() => {
    const total = Object.values(progress).reduce((acc, curr) => acc + curr, 0);
    setTotalProgress(total / 5);
    console.log("TOTAL progress", total / 5);
  }, [progress]);

  useEffect(() => {
    if (allLoaded) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [allLoaded]);

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
      {!showContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900">
          <div className="relative flex flex-col items-center justify-center gap-2">
            <div className="relative  w-[280px] sm:w-[320px] md:w-[380px] lg:w-[400px]">
              <img
                src="/logos/logo.png"
                alt="HackFest Logo"
                className="mx-auto w-[70%] sm:w-[75%] md:w-[80%]"
              />
            </div>
            <div className="flex w-full flex-col items-center gap-2">
              <ProgressBar progress={totalProgress} />
              <span className="font-anton text-xl text-white sm:text-2xl md:text-3xl">
                {totalProgress.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ visibility: showContent ? "visible" : "hidden" }}>
        <RootLayout>
          <BackgroundWrapper>
            <main className="relative mx-auto overflow-y-clip">
              <div className="relative z-10">
                <Hero
                  onLoaded={() => handleComponentLoad("hero")}
                  onProgress={handleProgress}
                />
                <Sponsors />
                <PrizePool
                  onLoaded={() => handleComponentLoad("prizePool")}
                  onProgress={handleProgress}
                />

                <Domains
                  onLoaded={() => handleComponentLoad("domain")}
                  onProgress={handleProgress}
                />

                <Sponsors />

                <AboutUs
                  onLoaded={() => handleComponentLoad("about")}
                  onProgress={handleProgress}
                />

                <Timeline
                  onLoaded={() => handleComponentLoad("timeline")}
                  onProgress={handleProgress}
                />

                <FAQSection />
              </div>
            </main>
          </BackgroundWrapper>
        </RootLayout>
      </div>
    </div>
  );
}
