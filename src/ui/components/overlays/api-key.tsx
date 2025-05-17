import React from 'react';
import { Text, Link, AlertDialog } from 'figma-kit';
import UpdateKeyDialog from '../dialogs/update-key';
import { useAnthropic } from '../../context/anthropic';
import AnthropicLogo from '../icons/anthropic-logo';

interface ApiKeyOverlayProps {
  showLogo?: boolean;
}

function ApiKeyOverlay({ showLogo = false }: ApiKeyOverlayProps): React.JSX.Element {
  const { anthropicKey } = useAnthropic();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[var(--figma-color-bg)]'>
      <div className='flex flex-col items-center px-4 text-center'>
        {showLogo && <AnthropicLogo className='mb size-9 text-[var(--figma-color-icon)]' />}
        <Text size='large' className='text-lg font-bold mb-1 text-[var(--figma-color-text)]'>
          Get started
        </Text>
        <Text>In order to use this plugin, you must have an Anthropic account with an API key.</Text>
        <Link href='https://docs.anthropic.com/en/api/overview' target='_blank' className='mb-4'>
          Learn more
        </Link>
        <AlertDialog.Root>
          <UpdateKeyDialog
            dialogTitle='Add key'
            anthropicKey={anthropicKey}
            actionLabel='Add key'
            buttonVariant='primary'
          />
        </AlertDialog.Root>
      </div>
    </div>
  );
}

export default ApiKeyOverlay;
