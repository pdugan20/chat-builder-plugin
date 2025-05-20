import React from 'react';
import { Text, Button, Link } from 'figma-kit';
import AlertIcon from '../icons/alert';

interface AlertBannerProps {
  onReload?: () => void;
}

function AlertBanner({ onReload }: AlertBannerProps): React.JSX.Element {
  return (
    <div className='flex items-center justify-between gap-3 border-b border-[var(--figma-color-border)] bg-[var(--figma-color-bg)] px-4 py-3'>
      <div className='flex items-center gap-3'>
        <div className='flex size-4 items-center justify-center'>
          <AlertIcon size={12} color='var(--figma-color-text)' />
        </div>
        <Text className='text-sm text-[var(--figma-color-text)]'>
          This plugin can only be run in files with access to the <Link href='#'>iMessage Chat Builder UI Kit</Link>.
        </Text>
      </div>
      <Button variant='secondary' size='small' onClick={onReload}>
        Reload
      </Button>
    </div>
  );
}

export default AlertBanner;
