import { useState, useEffect } from "react";

interface LoaderProps {
  progress: number;
}

const ProgressBar = ({ progress }: LoaderProps) => {
  // Base size for the SVG
  const baseSize = {
    sm: 300, // mobile
    md: 350, // tablet
    lg: 400, // desktop
  };

  // Get current viewport width
  const [size, setSize] = useState(baseSize.lg);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSize(baseSize.sm);
      } else if (window.innerWidth < 1024) {
        setSize(baseSize.md);
      } else {
        setSize(baseSize.lg);
      }
    };

    // Initial size set
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const strokeWidth = Math.max(2, size * 0.005); // Responsive stroke width
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress * circumference) / 100;
  const gap = circumference - dash;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#1e293b"
        strokeWidth={strokeWidth}
      />

      {/* Progress circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        className="transition-all duration-300 ease-out"
      />
    </svg>
  );
};

const IntegratedProgressLoader = (totalProgress: number) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900">
      <div className="relative flex flex-col items-center justify-center gap-4">
        <div className="relative h-96 w-96">
          <ProgressBar progress={totalProgress} />
          <img
            src="/logos/logo.png"
            alt="HackFest Logo"
            className="absolute left-1/2 top-1/2 z-10 size-80 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <span className="font-anton text-4xl text-white">
          {totalProgress.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
