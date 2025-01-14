import React, { useEffect, useRef } from "react";

const DustOverlay = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  const createParticle = () => {
    if (!containerRef.current) return;

    const particle = document.createElement("div");
    particle.className = "dust-particle";

    const randomX = Math.random() * 100;
    const size = Math.random() * 2 + 1; // Smaller size for more subtle effect
    const duration = Math.random() * 4 + 6;

    particle.style.left = `${randomX}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDuration = `${duration}s`;

    containerRef.current.appendChild(particle);
    particlesRef.current.push(particle);

    setTimeout(() => {
      if (
        containerRef.current &&
        particle.parentElement === containerRef.current
      ) {
        containerRef.current.removeChild(particle);
        particlesRef.current = particlesRef.current.filter(
          (p) => p !== particle,
        );
      }
    }, duration * 1000);
  };

  useEffect(() => {
    for (let i = 0; i < 100; i++) {
      createParticle();
    }

    const particleInterval = setInterval(createParticle, 50);
    const container = containerRef.current;

    return () => {
      clearInterval(particleInterval);
      // Cleanup all particles safely
      if (container) {
        particlesRef.current.forEach((particle) => {
          if (particle.parentElement === container) {
            container.removeChild(particle);
          }
        });
        particlesRef.current = [];
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 45,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          .dust-particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            box-shadow: 0 0 2px rgba(255, 255, 255, 0.4);
            animation: float-up linear infinite;
            pointer-events: none;
          }

          @keyframes float-up {
            from {
              transform: translateY(100vh) translateX(0);
              opacity: 0.8;
            }
            to {
              transform: translateY(-20vh) translateX(200px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DustOverlay;
