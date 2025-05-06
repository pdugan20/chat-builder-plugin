import React, { useState } from 'react';
import { AlertDialog, Text, Button, Input, Link } from 'figma-kit';
import Navigation from '../navigation';

const screen = 'settings';
const keyLength = 108;
const pluginVersion = '1.0';

function SettingsScreen(): React.JSX.Element {
  const [key, setKey] = useState('');
  const [keyIsValid, setKeyIsValid] = useState(false);

  interface HandleInputChangeProps {
    apiKey: string;
  }

  function handleInputChange({ apiKey }: { apiKey: HandleInputChangeProps['apiKey'] }): void {
    setKey(apiKey);
    setKeyIsValid(apiKey.length === keyLength);
  }

  function renderNav(): React.JSX.Element {
    return <Navigation screen={screen} />;
  }

  function renderKey(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Anthropic API key</Text>
        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Link href='#'>Add key</Link>
          </AlertDialog.Trigger>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <AlertDialog.Title>Add key</AlertDialog.Title>
            <AlertDialog.Description>Enter your Anthropic API key.</AlertDialog.Description>
            <Input
              name='anthropicKey'
              placeholder='Ex. sk-ant-api03-nCjQtbsOljqx4VkPL'
              value={key}
              onChange={(e) => handleInputChange({ apiKey: e.target.value })}
              maxLength={keyLength}
            />
            <AlertDialog.Actions>
              <AlertDialog.Cancel>
                <Button>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Cancel>
                <Button variant='primary' disabled={!keyIsValid}>
                  Save
                </Button>
              </AlertDialog.Cancel>
            </AlertDialog.Actions>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    );
  }

  function renderVersionNumber(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Version</Text>
        <Text>{pluginVersion}</Text>
      </div>
    );
  }

  function renderFeedbackLink(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Feedback</Text>
        <Link href='#'>Report a bug</Link>
      </div>
    );
  }

  function renderBody(): React.JSX.Element {
    return (
      <div className='body'>
        {renderVersionNumber()}
        {renderKey()}
        {renderFeedbackLink()}
      </div>
    );
  }

  return (
    <div>
      {renderNav()}
      {renderBody()}
    </div>
  );
}

export default SettingsScreen;
