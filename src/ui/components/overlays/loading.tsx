import React, { useState, useEffect } from 'react';
import { Text } from 'figma-kit';

const loadingStages = [
  'Initializing chat generation...',
  'Analyzing conversation parameters...',
  'Crafting messages and reactions...',
  'Formatting conversation data...',
  'Almost there...',
];

function LoadingOverlay(): React.JSX.Element {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 3000);

    return () => {
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className='loading-overlay fixed inset-0 z-50 flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <div className='size-5 animate-spin rounded-full border-2 border-[var(--figma-color-icon-brand)] border-t-transparent' />
        <Text className='text-sm whitespace-pre-line px-10 text-center text-[var(--figma-color-text-secondary)]'>
          {loadingStages[currentStage]}
        </Text>
      </div>
    </div>
  );
}

export default LoadingOverlay;
