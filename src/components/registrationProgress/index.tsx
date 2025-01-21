import { useContext } from "react";
import { ProgressContext } from "../progressProvider";

type Props = {
  status: {
    sections: ("active" | "pending" | "complete" | "draft")[];
    // current: 0 | 1 | 2;
  };
};

const colors = {
  active: "#024655",
  complete: "#024655",
  pending: "black",
  draft: "rgb(100, 100, 100)",
};

const Progress = () => {
  // console.log("progress");
  const { currentState, maxState, setCurrentState } =
    useContext(ProgressContext);

  const progress = registrationProgress(currentState, maxState);
  return (
    <div
      className={`relative mx-auto mb-6 mt-3 h-3 w-[calc(90%-1rem)] rounded-sm border border-white/20 text-lg`}
    >
      {progress.map((section, index) => {
        return (
          <div key={index}>
            {index > 0 && (
              <div
                className="absolute top-0 z-[0] h-full w-1/2 transition-all duration-300"
                key={`bar-${index}`}
                style={{
                  left: `${(index - 1) * 50}%`,
                  backgroundColor: colors[`${section}`],
                }}
              ></div>
            )}
            <div
              onClick={() => {
                if (index > maxState) return;
                setCurrentState(index);
              }}
              className={`${
                index > maxState ? "pointer-events-none cursor-not-allowed" : ""
              } h-8 w-8 cursor-pointer rounded-full md:h-12 md:w-12 ${
                section === "complete"
                  ? "border-white/10"
                  : section === "active"
                    ? "border-white/20"
                    : "border-white/20"
              } absolute top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-300`}
              style={{
                left: `${index * 50}%`,
                backgroundColor: colors[`${section}`],
                scale: section === "active" ? 1.2 : 1,
                borderWidth: 1,
              }}
              key={`step-${index}`}
            >
              {index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Progress;

const registrationProgress = (
  currentProgress: number,
  maxProgress: number,
): ("active" | "complete" | "pending" | "draft")[] => {
  switch (maxProgress) {
    case 1:
      switch (currentProgress) {
        case 0:
          return ["active", "draft", "pending"];
        default:
          return ["complete", "active", "pending"];
      }
    case 2:
      switch (currentProgress) {
        case 0:
          return ["active", "draft", "draft"];
        case 1:
          return ["complete", "active", "draft"];
        default:
          return ["complete", "complete", "active"];
      }
    case 3:
      return ["complete", "complete", "complete"];
    default:
      return ["active", "pending", "pending"];
  }
};
