import React from 'react';
import { Text, Button } from 'figma-kit';
import AlertIcon from '../icons/alert';

interface AlertBannerProps {
  text: string | React.ReactNode;
  showIcon?: boolean;
  buttonText?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
}

function AlertBanner({
  text,
  showIcon = true,
  buttonText = 'Reload',
  showButton = true,
  onButtonClick,
}: AlertBannerProps): React.JSX.Element {
  return (
    <div className='flex items-center justify-between gap-3 border-b border-[var(--figma-color-border)] bg-[var(--figma-color-bg)] px-4 py-3'>
      <div className='flex items-center gap-3'>
        {showIcon && (
          <div className='flex size-4 items-center justify-center'>
            <AlertIcon size={12} color='var(--figma-color-text)' />
          </div>
        )}
        <Text className='text-sm text-[var(--figma-color-text)]'>{text}</Text>
      </div>
      {showButton && (
        <Button variant='secondary' size='small' onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}

export default AlertBanner;
