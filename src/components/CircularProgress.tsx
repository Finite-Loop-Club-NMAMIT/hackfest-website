interface CircularProgressProps {
  progress: number;
}

const CircularProgress = ({ progress }: CircularProgressProps) => {
  return (
    <div className="absolute inset-0">
      <style jsx>{`
        .progress-ring {
          --size: 340px;
          --border: 3px;
          --arc: 15deg;
          width: var(--size);
          height: var(--size);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .progress-ring::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            #0a1128 0deg,
            #1b3c73 60deg,
            rgba(105, 180, 255, 0.3) 120deg,
            transparent 180deg
          );
          mask: radial-gradient(
            transparent calc(50% - var(--border)),
            white calc(50% - var(--border) + 1px)
          );
          -webkit-mask: radial-gradient(
            transparent calc(50% - var(--border)),
            white calc(50% - var(--border) + 1px)
          );
        }

        .progress-ring::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent ${progress * 3.6}deg,
            white ${progress * 3.6}deg,
            rgba(255, 255, 255, 0.9) calc(${progress * 3.6}deg + var(--arc)),
            transparent calc(${progress * 3.6}deg + var(--arc))
          );
          mask: radial-gradient(
            transparent calc(50% - var(--border)),
            white calc(50% - var(--border) + 1px)
          );
          -webkit-mask: radial-gradient(
            transparent calc(50% - var(--border)),
            white calc(50% - var(--border) + 1px)
          );
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }
      `}</style>
      <div className="progress-ring" />
    </div>
  );
};

export default CircularProgress;
