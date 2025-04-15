import React from 'react';
import Joyride, { type Step, EVENTS, STATUS, type CallBackProps } from 'react-joyride'; 
import { useTheme } from 'next-themes';

interface TutorialProps {
  run: boolean;
  steps: Step[];
  onComplete: () => void;
  continuous?: boolean;
  showSkipButton?: boolean;
}

const Tutorial: React.FC<TutorialProps> = ({ 
  run, 
  steps, 
  onComplete,
  continuous = true,
  showSkipButton = true
}) => {
  const { theme } = useTheme();
  
  const handleCallback = (data: CallBackProps) => {
    const { status, type } = data;

    // End tutorial when it's finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as typeof STATUS.FINISHED | typeof STATUS.SKIPPED)) {
      onComplete();
    }

    // Handle case when target element is not found
    if (type === EVENTS.TARGET_NOT_FOUND) {
      // Fix the TypeScript error by safely stringifying the target
      const targetStr = typeof data.step?.target === 'string' 
        ? data.step.target 
        : 'Non-string target';
      console.log(`Target not found: ${targetStr}`);
    }
  };

  return (
    <Joyride
      callback={handleCallback}
      continuous={continuous}
      run={run}
      hideCloseButton={false}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={showSkipButton}
      disableScrolling={false}
      disableOverlayClose={true}
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#6366f1',
          backgroundColor: theme === 'dark' ? '#3f3f46' : '#ffffff',
          textColor: theme === 'dark' ? '#f4f4f5' : '#18181b',
          arrowColor: theme === 'dark' ? '#3f3f46' : '#ffffff',
        },
        tooltip: {
          padding: '12px 16px',
          borderRadius: '8px',
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          color: 'white',
        },
        buttonBack: {
          color: theme === 'dark' ? '#a1a1aa' : '#71717a',
        },
        buttonSkip: {
          color: theme === 'dark' ? '#a1a1aa' : '#71717a',
        }
      }}
    />
  );
};

export default Tutorial;
