import React, { useState } from 'react';
import { Text, Button, Select } from 'figma-kit';
import TextareaAutosize from 'react-textarea-autosize';
import Navigation from '../navigation';

const screen = 'home';

function PluginScreen(): React.JSX.Element {
  const [style, setStyle] = useState('light');
  const [participants, setParticipants] = useState('2');
  const [maxMessages, setMaxMessages] = useState('15');
  const [prompt, setPrompt] = useState('');

  function renderNav(): React.JSX.Element {
    return <Navigation screen={screen} />;
  }

  function renderStyleSelect(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>UI style</Text>
        <Select.Root value={style} onValueChange={setStyle}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value='light'>Light</Select.Item>
            <Select.Item value='dark'>Dark</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    );
  }

  function renderParticipantsSelect(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Participants</Text>
        <Select.Root value={participants} onValueChange={setParticipants}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value='2'>2</Select.Item>
            <Select.Item disabled value='3'>
              3
            </Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    );
  }

  function renderMaxMessagesSelect(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Max number of messages</Text>
        <Select.Root value={maxMessages} onValueChange={setMaxMessages}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value='5'>5</Select.Item>
            <Select.Item value='10'>10</Select.Item>
            <Select.Item value='15'>15</Select.Item>
            <Select.Item value='20'>20</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    );
  }

  function renderPromptTextarea(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Prompt</Text>
        <TextareaAutosize
          className='fp-textarea focus:outline-1 focus:-outline-offset-1'
          minRows={3}
          placeholder='Ex. Friends talking about what movie they want to see this weekend.'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
    );
  }

  function renderBody(): React.JSX.Element {
    return (
      <div className='body'>
        {renderParticipantsSelect()}
        {renderMaxMessagesSelect()}
        {renderStyleSelect()}
        {renderPromptTextarea()}
      </div>
    );
  }

  function renderFooter(): React.JSX.Element {
    return (
      <div className='footer'>
        <Button variant='primary' size='medium' disabled={!prompt.trim()}>
          Generate chat
        </Button>
      </div>
    );
  }

  return (
    <div>
      {renderNav()}
      {renderBody()}
      {renderFooter()}
    </div>
  );
}

export default PluginScreen;
