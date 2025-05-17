import React, { useState } from 'react';
import { AlertDialog, Button, Input, Link } from 'figma-kit';
import { HandleInputChangeProps } from '../../types/props';

interface UpdateKeyDialogProps {
  dialogTitle: string;
  dialogDescription?: string;
  actionLabel?: string;
  anthropicKey: string;
  keyLength?: number;
  buttonVariant?: 'link' | 'primary';
}

function UpdateKeyDialog({
  dialogTitle,
  dialogDescription = 'Enter your Anthropic API key.',
  actionLabel = 'Add key',
  anthropicKey,
  keyLength = 108,
  buttonVariant = 'link',
}: UpdateKeyDialogProps): React.JSX.Element {
  const [apiKey, setKey] = useState(anthropicKey);
  const [keyIsValid, setKeyIsValid] = useState(false);

  function handleInputChange({ updatedKey }: { updatedKey: HandleInputChangeProps['updatedKey'] }): void {
    setKey(updatedKey);
    setKeyIsValid(updatedKey.length === keyLength);
  }

  function renderTrigger(): React.JSX.Element {
    return (
      <AlertDialog.Trigger>
        {buttonVariant === 'primary' ? (
          <Button variant='primary' size='medium'>
            {actionLabel}
          </Button>
        ) : (
          <Link href='#'>{actionLabel}</Link>
        )}
      </AlertDialog.Trigger>
    );
  }

  const handleCancelClick = () => {
    setKey(anthropicKey);
    setKeyIsValid(false);
  };

  const handleSaveClick = () => {
    parent.postMessage({ pluginMessage: { type: 'UPDATE_ANTHROPIC_KEY', apiKey } }, '*');
    setKeyIsValid(false);
  };

  function renderBody(): React.JSX.Element {
    return (
      <div className='text-left'>
        <AlertDialog.Title>{dialogTitle}</AlertDialog.Title>
        <AlertDialog.Description>{dialogDescription}</AlertDialog.Description>
        <Input
          name='anthropicKey'
          placeholder='Ex. sk-ant-api03-nCjQtbsOljqx4VkPL'
          value={apiKey}
          onChange={(e) => handleInputChange({ updatedKey: e.target.value })}
          maxLength={keyLength}
          spellCheck={false}
        />
      </div>
    );
  }

  function renderActions(): React.JSX.Element {
    return (
      <AlertDialog.Actions>
        <AlertDialog.Cancel>
          <Button onClick={handleCancelClick}>Cancel</Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button variant='primary' disabled={!keyIsValid} onClick={handleSaveClick}>
            Save
          </Button>
        </AlertDialog.Action>
      </AlertDialog.Actions>
    );
  }

  function renderContent(): React.JSX.Element {
    return (
      <AlertDialog.Content>
        {renderBody()}
        {renderActions()}
      </AlertDialog.Content>
    );
  }

  function renderOverlay(): React.JSX.Element {
    return <AlertDialog.Overlay />;
  }

  return (
    <AlertDialog.Root>
      {renderTrigger()}
      {renderOverlay()}
      {renderContent()}
    </AlertDialog.Root>
  );
}

export default UpdateKeyDialog;
