import React, { useState, useEffect } from 'react';
import { Text } from 'figma-kit';

interface LoadingOverlayProps {
  showSpinner?: boolean;
}

const loadingStages = [
  'Initializing chat generation',
  'Analyzing conversation inputs',
  'Authoring messages and reactions',
  'Formatting conversation data',
  'Finishing up',
];

const TIMEOUT_DURATION = 30000;

function LoadingOverlay({ showSpinner = false }: LoadingOverlayProps): React.JSX.Element {
  const [currentStage, setCurrentStage] = useState(0);
  const [key, setKey] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsTimedOut(true);
    }, TIMEOUT_DURATION);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        const nextStage = prev < loadingStages.length - 1 ? prev + 1 : prev;
        setKey((k) => k + 1);

        if (nextStage === loadingStages.length - 1) {
          clearInterval(stageInterval);
        }

        return nextStage;
      });
    }, 3500);

    return () => {
      clearInterval(stageInterval);
      clearTimeout(timeoutId);
    };
  }, []);

  const currentMessage = isTimedOut ? 'This is taking longer than expected. Please wait' : loadingStages[currentStage];

  return (
    <div
      className='loading-overlay fixed inset-0 z-50 flex items-center justify-center'
      role='alert'
      aria-live='polite'
    >
      <div className='flex flex-col items-center gap-3'>
        {showSpinner && (
          <div
            className='size-5 animate-spin rounded-full border-2 border-[var(--figma-color-icon-brand)] border-t-transparent'
            aria-hidden='true'
          />
        )}
        <Text key={key} className='loading-stage loading-dots text-sm text-[var(--figma-color-text-secondary)]'>
          {currentMessage}
        </Text>
      </div>
    </div>
  );
}

export default LoadingOverlay;
