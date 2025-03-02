import { useState, useEffect, useCallback, useRef } from "react";
import Domains from "~/components/domains2";
import Hero from "~/components/hero";
import RootLayout from "~/components/layout";
import PrizePool from "~/components/prizePool";
import Sponsors from "~/components/sponsors";
import Timeline from "~/components/timeline";
import { BackgroundWrapper } from "~/components/layout/backgroundWrapper";

export default function Home() {
  const [componentsLoaded, setComponentsLoaded] = useState({
    hero: false,
    prizePool: false,
    timeline: false,
    domain: false,
  });

  const loadedComponents = useRef(new Set());
  const [showContent, setShowContent] = useState(false);
  const [progress, setProgress] = useState({
    domain: 0,
    hero: 0,
    prizePool: 0,
    timeline: 0,
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
    setTotalProgress(total / 4);
    console.log("TOTAL progress", total / 4);
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
          <div className="font-anton  text-4xl text-white">
            {totalProgress.toFixed(2)}%
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
                <PrizePool
                  onLoaded={() => handleComponentLoad("prizePool")}
                  onProgress={handleProgress}
                />
                <Timeline
                  onLoaded={() => handleComponentLoad("timeline")}
                  onProgress={handleProgress}
                />
                <Domains
                  onLoaded={() => handleComponentLoad("domain")}
                  onProgress={handleProgress}
                />
                <Sponsors />
              </div>
            </main>
          </BackgroundWrapper>
        </RootLayout>
      </div>
    </div>
  );
}
