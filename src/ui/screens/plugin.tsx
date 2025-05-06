import React, { useState } from 'react';
import { Text, Button, Select } from 'figma-kit';
import TextareaAutosize from 'react-textarea-autosize';
import Navigation from '../navigation';

const screen = 'home';

function PluginScreen({}) {
  const [style, setStyle] = useState('light');
  const [participants, setParticipants] = useState('2');
  const [maxMessages, setMaxMessages] = useState('15');
  const [prompt, setPrompt] = useState('');

  const renderNav = () => {
    return <Navigation screen={screen} />;
  };

  const renderStyleSelect = () => {
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
  };

  const renderParticipantsSelect = () => {
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
  };

  const renderMaxMessagesSelect = () => {
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
  };

  const renderPromptTextarea = () => {
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
  };

  const renderBody = () => {
    return (
      <div className='body'>
        {renderParticipantsSelect()}
        {renderMaxMessagesSelect()}
        {renderStyleSelect()}
        {renderPromptTextarea()}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className='footer'>
        <Button variant='primary' size='medium'>
          Generate chat
        </Button>
      </div>
    );
  };

  return (
    <div>
      {renderNav()}
      {renderBody()}
      {renderFooter()}
    </div>
  );
}

export default PluginScreen;
