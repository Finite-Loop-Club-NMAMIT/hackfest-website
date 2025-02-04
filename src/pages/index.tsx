import { useState, useEffect, useCallback, useRef } from 'react';
import Domains from "~/components/domains2";
import Hero from "~/components/hero";
import RootLayout from "~/components/layout";
import PrizePool from "~/components/prizePool";
import Timeline from "~/components/timeline";

export default function Home() {
  const [componentsLoaded, setComponentsLoaded] = useState({
    hero: false,
    prizePool: false,
    timeline: false,
    domain: false
  });
  
  const loadedComponents = useRef(new Set());
  const [showContent, setShowContent] = useState(false);

  const handleComponentLoad = useCallback((component: keyof typeof componentsLoaded) => {
    if (!loadedComponents.current.has(component)) {
      loadedComponents.current.add(component);
      setComponentsLoaded(prev => ({
        ...prev,
        [component]: true
      }));
    }
  }, []);

  const allLoaded = Object.values(componentsLoaded).every(Boolean);

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
    }else{
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
          <div className="text-4xl font-bold text-white">
            Loading HackFest...
          </div>
        </div>
      )}

      <div style={{ visibility: showContent ? 'visible' : 'hidden' }}>
        <RootLayout>
          <main className="relative mx-auto overflow-y-clip bg-slate-900">
            <Hero onLoaded={() => handleComponentLoad('hero')} />
            <PrizePool onLoaded={() => handleComponentLoad('prizePool')} />
            <Timeline onLoaded={() => handleComponentLoad('timeline')} />
            <Domains onLoaded={() => handleComponentLoad('domain')} />
          </main>
        </RootLayout>
      </div>
    </div>
  );
}