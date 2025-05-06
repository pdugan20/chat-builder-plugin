import React, { useState } from 'react';
import { AlertDialog, Text, Button, Input } from 'figma-kit';
import Navigation from '../navigation';

const screen = 'settings';
const keyLength = 108;

function SettingsScreen({}) {
  const [key, setKey] = useState('');
  const [keyIsValid, setKeyIsValid] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setKey(value);
    setKeyIsValid(value.length === keyLength);
  };

  const renderNav = () => {
    return <Navigation screen={screen} />;
  };

  const renderKey = () => {
    return (
      <div className='row-item'>
        <Text className='heading'>Anthropic API key</Text>
        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Button variant='secondary'>Add key</Button>
          </AlertDialog.Trigger>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <AlertDialog.Title>Add key</AlertDialog.Title>
            <AlertDialog.Description>Enter your Anthropic API key.</AlertDialog.Description>
            <Input
              name='anthropicKey'
              placeholder='Ex. sk-ant-api03-nCjQtbsOljqx4VkPL'
              value={key}
              onChange={handleInputChange}
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
  };

  const renderBody = () => {
    return <div className='body'>{renderKey()}</div>;
  };

  return (
    <div>
      {renderNav()}
      {renderBody()}
    </div>
  );
}

export default SettingsScreen;
