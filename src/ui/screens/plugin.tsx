import React, { useState } from 'react';
import { Text, Button, Select, Link } from 'figma-kit';
import TextareaAutosize from 'react-textarea-autosize';
import Navigation from '../navigation';
import promptExamples from '../../constants/prompts';
import createChatQuery from '../../api/anthropic';
import cleanAndParseJson from '../../utils/json';
import chatData from '../../constants/test-data';
import { useAnthropic } from '../context/anthropic';
import LoadingOverlay from '../components/loading-overlay';
import ApiKeyOverlay from '../components/api-key-overlay';

const MESSAGE_COUNT_OPTIONS = ['5', '10', '15', '20'];
const STYLE_OPTIONS = ['light', 'dark'];
const PARTICIPANT_OPTIONS = ['2', '3'];

interface PluginScreenProps {
  screen?: string;
  defaultStyle?: string;
  defaultParticipants?: string;
  defaultMaxMessages?: string;
  useTestData?: boolean;
}

function PluginScreen({
  screen = 'home',
  defaultStyle = 'light',
  defaultParticipants = '2',
  defaultMaxMessages = '15',
  useTestData = false,
}: PluginScreenProps): React.JSX.Element {
  const { anthropicKey, isLoading } = useAnthropic();
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
            {STYLE_OPTIONS.map((value) => (
              <Select.Item key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Select.Item>
            ))}
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
            {PARTICIPANT_OPTIONS.map((value) => (
              <Select.Item key={value} value={value} disabled={value === '3'}>
                {value}
              </Select.Item>
            ))}
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
            {MESSAGE_COUNT_OPTIONS.map((value) => (
              <Select.Item key={value} value={value}>
                {value}
              </Select.Item>
            ))}
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

      try {
        if (useTestData) {
          const data = chatData;
          parent.postMessage(
            {
              pluginMessage: { type: 'BUILD_CHAT_UI', data, style, prompt },
            },
            '*'
          );
          return;
        }

        const response = await createChatQuery({
          apiKey: anthropicKey,
          queryInputs: { participants, maxMessages, prompt },
        });

        if (!response?.content?.[0]?.text) {
          return;
        }

        const data = cleanAndParseJson(response.content[0].text);
        parent.postMessage(
          {
            pluginMessage: { type: 'BUILD_CHAT_UI', data, style, prompt },
          },
          '*'
        );
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

  if (isLoading) {
    return null;
  }

  return (
    <>
      <div className={`${anthropicKey ? 'visible' : 'invisible'} relative`}>
        {renderNav()}
        {renderBody()}
        {renderFooter()}
        {loading && <LoadingOverlay />}
      </div>
      {!anthropicKey && <ApiKeyOverlay />}
    </>
  );
}

export default PluginScreen;
