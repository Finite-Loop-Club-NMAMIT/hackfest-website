import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import Joyride, { type Step, type CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride'; // Import EVENTS and ACTIONS
import { useTheme } from 'next-themes';

interface TutorialProps {
  run: boolean;
  steps: Step[];
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ run, steps, onComplete }) => {
  const { theme } = useTheme();
  const [stepIndex, setStepIndex] = useState(0); // State for controlled step index

  // Effect to reset step index when the tour starts
  useEffect(() => {
    if (run) {
      setStepIndex(0);
    }
  }, [run]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status as string)) {
      // Reset index on finish/skip and call the completion handler
      setStepIndex(0);
      onComplete();
    } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type as string)) {
      // Update step index based on action (next/prev)
      // 'index' is the current step index, 'action' indicates 'next' or 'prev'
      const nextStepIndex: number = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextStepIndex);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex} // Control the step index
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000, // Ensure it's above other elements
          arrowColor: theme === 'dark' ? '#3f3f46' : '#ffffff', // zinc-700 or white
          backgroundColor: theme === 'dark' ? '#3f3f46' : '#ffffff',
          primaryColor: '#6366f1', // indigo-500
          textColor: theme === 'dark' ? '#f4f4f5' : '#18181b', // zinc-100 or zinc-900
        },
        tooltip: {
          borderRadius: '0.5rem', // rounded-lg
          padding: '1rem 1.5rem', // p-4 md:p-6
        },
        buttonNext: {
            backgroundColor: '#6366f1', // indigo-500
            borderRadius: '0.375rem', // rounded-md
            padding: '0.5rem 1rem', // px-4 py-2
            fontSize: '0.875rem', // text-sm
        },
        buttonBack: {
            color: theme === 'dark' ? '#a1a1aa' : '#71717a', // zinc-400 or zinc-500
            marginRight: '0.5rem', // mr-2
            fontSize: '0.875rem', // text-sm
        },
        buttonSkip: {
            color: theme === 'dark' ? '#a1a1aa' : '#71717a', // zinc-400 or zinc-500
            fontSize: '0.875rem', // text-sm
        },
        spotlight: {
            borderRadius: '0.5rem', // rounded-lg
        }
      }}
    />
  );
};

export default Tutorial;
