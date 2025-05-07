import React, { useState } from 'react';
import { AlertDialog, Button, Input, Link } from 'figma-kit';

const keyLength = 108;

function UpdateKeyDialog({ title }): React.JSX.Element {
  const [apiKey, setKey] = useState('');
  const [keyIsValid, setKeyIsValid] = useState(false);

  interface HandleInputChangeProps {
    updatedKey: string;
  }

  function handleInputChange({ updatedKey }: { updatedKey: HandleInputChangeProps['updatedKey'] }): void {
    setKey(updatedKey);
    setKeyIsValid(updatedKey.length === keyLength);
  }

  function renderTrigger(): React.JSX.Element {
    return (
      <AlertDialog.Trigger>
        <Link href='#'>Add key</Link>
      </AlertDialog.Trigger>
    );
  }

  const handleCancelClick = () => {
    setKey('');
  };

  const handleSaveClick = () => {
    parent.postMessage({ pluginMessage: { type: 'updateAnthropicKey', apiKey } }, '*');
  };

  function renderBody(): React.JSX.Element {
    return (
      <div>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>Enter your Anthropic API key.</AlertDialog.Description>
        <Input
          name='anthropicKey'
          placeholder='Ex. sk-ant-api03-nCjQtbsOljqx4VkPL'
          value={apiKey}
          onChange={(e) => handleInputChange({ updatedKey: e.target.value })}
          maxLength={keyLength}
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
