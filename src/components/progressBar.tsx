import { useState, useEffect } from "react";

interface LoaderProps {
  progress: number;
}

const ProgressBar = ({ progress }: LoaderProps) => {
  const baseWidth = {
    sm: 240,
    md: 320,
    lg: 400,
  };

  const [width, setWidth] = useState(baseWidth.lg);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setWidth(baseWidth.sm);
      } else if (window.innerWidth < 1024) {
        setWidth(baseWidth.md);
      } else {
        setWidth(baseWidth.lg);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="relative h-2 overflow-hidden rounded-full"
      style={{ width }}
    >
      <div className="absolute inset-0 bg-slate-800" />
      <div
        className="absolute inset-0 rounded-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
