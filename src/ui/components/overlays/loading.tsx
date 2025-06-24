import React, { useState, useEffect } from 'react';
import { Text } from 'figma-kit';
import loadingConstants from '../../../constants/loading';

interface LoadingOverlayProps {
  streamingMessages?: string;
  showStreamingText?: boolean;
  showSpinner?: boolean;
}

interface AnimatedMessageProps {
  message: string;
  dots: string;
}

function AnimatedMessage({ message, dots }: AnimatedMessageProps): React.JSX.Element {
  return (
    <Text
      key={message}
      className='loading-stage text-sm animate-up min-w-[300px] text-center text-[var(--figma-color-text-secondary)]'
    >
      {message}
      <span className='inline-block w-4 text-left'>{dots}</span>
    </Text>
  );
}

const loadingStages = [
  'Initializing chat generation',
  'Analyzing conversation inputs',
  'Authoring messages and reactions',
  'Formatting conversation data',
  'Finishing up',
];

function LoadingOverlay({
  streamingMessages = '',
  showStreamingText = false,
  showSpinner = false,
}: LoadingOverlayProps): React.JSX.Element {
  const [currentStage, setCurrentStage] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsTimedOut(true);
    }, loadingConstants.TIMEOUT_DURATION);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        const nextStage = prev < loadingStages.length - 1 ? prev + 1 : prev;

        if (nextStage === loadingStages.length - 1) {
          clearInterval(stageInterval);
        }

        return nextStage;
      });
    }, 3500);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 500);

    return () => {
      clearInterval(stageInterval);
      clearTimeout(timeoutId);
      clearInterval(dotsInterval);
    };
  }, []);

  const currentMessage = isTimedOut ? "We're still working. Please wait" : loadingStages[currentStage];

  return (
    <div className='loading-overlay fixed inset-0 z-50 flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        {showSpinner && (
          <div
            className='size-5 animate-spin rounded-full border-2 border-[var(--figma-color-icon-brand)] border-t-transparent'
            aria-hidden='true'
          />
        )}
        <AnimatedMessage message={currentMessage} dots={dots} />
        {showStreamingText && streamingMessages && (
          <div className='rounded-lg mt-4 max-h-40 w-full overflow-y-auto bg-[var(--figma-color-bg-secondary)] p-4'>
            <Text className='text-sm whitespace-pre-line text-[var(--figma-color-text)]'>{streamingMessages}</Text>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;
