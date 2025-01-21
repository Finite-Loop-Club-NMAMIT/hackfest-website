import { Dispatch, ReactNode, createContext, useState } from "react";

// const ProgrssContext = createContext({currentStep: 1, maxStep: 1, setMaxStep: () => {}, setCurrentStep: () => {}});
export const ProgressContext = createContext<{
  currentState: number;
  maxState: number;
  setCurrentState: Dispatch<number>;
  setMaxState: Dispatch<number>;
}>({
  currentState: 1,
  maxState: 1,
  setCurrentState: () => {
    return;
  },
  setMaxState: () => {
    return;
  },
});

const ProgressProvider = ({
  children,
  initialStep,
}: {
  children: ReactNode;
  initialStep: number;
}) => {
  const [currentState, setCurrentState] = useState(initialStep);
  const [maxState, setMaxState] = useState(initialStep);
  return (
    <ProgressContext.Provider
      value={{ currentState, maxState, setCurrentState, setMaxState }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressProvider;
