import React from 'react';
import { Text } from 'figma-kit';

interface LoadingOverlayProps {
  message?: string;
}

function LoadingOverlay({
  message = 'Generating your chat. This may take a few seconds.',
}: LoadingOverlayProps): React.JSX.Element {
  return (
    <div className='loading-overlay fixed inset-0 z-50 flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <div className='size-5 animate-spin rounded-full border-2 border-[var(--figma-color-icon-brand)] border-t-transparent' />
        <Text className='whitespace-pre-line px-10 text-center'>{message}</Text>
      </div>
    </div>
  );
}

export default LoadingOverlay;
