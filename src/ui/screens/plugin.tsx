import React, { useState } from 'react';
import { Text, Button, Select, Link } from 'figma-kit';
import TextareaAutosize from 'react-textarea-autosize';
import Navigation from '../navigation';
import promptExamples from '../../constants/prompts';
import createChatQuery from '../../api/anthropic';
import cleanAndParseJson from '../../utils/json';

interface PluginScreenProps {
  anthropicKey: string;
  screen?: string;
  defaultStyle?: string;
  defaultParticipants?: string;
  defaultMaxMessages?: string;
  formVisibility?: string;
}

function PluginScreen({
  anthropicKey,
  screen = 'home',
  defaultStyle = 'light',
  defaultParticipants = '2',
  defaultMaxMessages = '15',
  formVisibility = 'invisible',
}: PluginScreenProps): React.JSX.Element {
  const [style, setStyle] = useState(defaultStyle);
  const [participants, setParticipants] = useState(defaultParticipants);
  const [maxMessages, setMaxMessages] = useState(defaultMaxMessages);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

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
    const shufflePrompt = () => {
      const randomPrompt = promptExamples[Math.floor(Math.random() * promptExamples.length)];
      setPrompt(randomPrompt);
    };

    const clearPrompt = () => {
      setPrompt('');
    };

    return (
      <div className='row-item'>
        <div className='heading-parent'>
          <Text className='heading'>Prompt</Text>
          <div className='actionGroup'>
            {prompt.trim() && (
              <div className='clearActionGroup'>
                <Link
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    clearPrompt();
                  }}
                >
                  Clear
                </Link>
                <Text className='linkSeparator'>&#183;</Text>
              </div>
            )}
            <Link
              href='#'
              onClick={(e) => {
                e.preventDefault();
                shufflePrompt();
              }}
            >
              Shuffle prompt
            </Link>
          </div>
        </div>
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
    const handleSubmit = async () => {
      setLoading(true);

      const queryInputs = {
        style,
        participants,
        maxMessages,
        prompt,
      };

      try {
        // const response = await createChatQuery({ apiKey: anthropicKey, queryInputs });
        // if (response) {
        //   parent.postMessage(
        //     { pluginMessage: { type: 'BUILD_CHAT_UI', data: cleanAndParseJson(response.content[0].text) } },
        //     '*'
        //   );
        // }
        const data = '';
        parent.postMessage({ pluginMessage: { type: 'BUILD_CHAT_UI', data, style } }, '*');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className='footer'>
        <Button variant='primary' size='medium' disabled={!prompt.trim() || loading} onClick={handleSubmit}>
          Generate chat
        </Button>
      </div>
    );
  }

  const visibility = anthropicKey ? 'visible' : formVisibility;

  return (
    <div className={`${visibility}`}>
      {renderNav()}
      {renderBody()}
      {renderFooter()}
    </div>
  );
}

export default PluginScreen;
