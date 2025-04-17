import React, { useEffect, useState, useRef } from "react";

const Marquee = () => {
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const message = "EXTENDED! SUBMIT IDEAS BY 24 MAR";
  const repetitions = 20;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      setPosition((prevPosition) => {
        const messageWidth = container.firstElementChild?.clientWidth ?? 0;
        if (prevPosition <= -messageWidth) {
          return 0;
        }
        return prevPosition - 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute z-[50] h-5 w-full overflow-hidden bg-blue-950">
      <div
        ref={containerRef}
        className="flex items-center whitespace-nowrap text-sm font-medium text-cyan-300"
        style={{ transform: `translateX(${position}px)` }}
      >
        {Array.from({ length: repetitions }).map((_, index) => (
          <span key={index} className="px-6">
            {message}
            <span className="px-4">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
