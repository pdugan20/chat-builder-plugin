import React, { useState } from 'react';
import { AlertDialog, Button, Input, Link } from 'figma-kit';

interface UpdateKeyDialogProps {
  dialogTitle: string;
  dialogDescription?: string;
  actionLabel?: string;
  anthropicKey: string;
  keyLength?: number;
}

interface HandleInputChangeProps {
  updatedKey: string;
}

function UpdateKeyDialog({
  dialogTitle,
  dialogDescription = 'Enter your Anthropic API key.',
  actionLabel = 'Add key',
  anthropicKey,
  keyLength = 108,
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
        <Link href='#'>{actionLabel}</Link>
      </AlertDialog.Trigger>
    );
  }

  const handleCancelClick = () => {
    setKey(anthropicKey);
  };

  const handleSaveClick = () => {
    parent.postMessage({ pluginMessage: { type: 'UPDATE_ANTHROPIC_KEY', apiKey } }, '*');
  };

  function renderBody(): React.JSX.Element {
    return (
      <div>
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
