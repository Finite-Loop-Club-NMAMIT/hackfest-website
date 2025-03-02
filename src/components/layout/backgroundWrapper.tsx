// src/components/layout/BackgroundWrapper.tsx
import { useTexture } from "@react-three/drei";
import { PropsWithChildren } from 'react';

export const BackgroundWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative w-full min-h-screen">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/bg2.jpg')",
          backgroundAttachment: "scroll",
          backgroundSize: "cover"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/95" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};