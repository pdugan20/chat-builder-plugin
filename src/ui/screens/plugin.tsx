import React, { useState, useEffect } from 'react';
import { Text, Button, Select, Link } from 'figma-kit';
import TextareaAutosize from 'react-textarea-autosize';
import Navigation from '../navigation';
import promptExamples from '../../constants/prompts';
import createChatQuery from '../../api/anthropic';
import cleanAndParseJson from '../../utils/json';
import chatData from '../../constants/test-data';
import { useAnthropic } from '../context/anthropic';
import LoadingOverlay from '../components/overlays/loading';
import ApiKeyOverlay from '../components/overlays/api-key';
import { MESSAGE_TYPE } from '../../constants/messages';

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
  const [hasFonts, setHasFonts] = useState(false);
  const [hasComponentLibrary, setHasComponentLibrary] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data.pluginMessage;

      switch (type) {
        case MESSAGE_TYPE.LOAD_REQUIRED_FONTS:
          setHasFonts(event.data.pluginMessage.hasFonts);
          break;
        case MESSAGE_TYPE.HAS_COMPONENT_LIBRARY:
          setHasComponentLibrary(event.data.pluginMessage.hasLibrary);
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
              pluginMessage: { type: MESSAGE_TYPE.BUILD_CHAT_UI, data, style, prompt },
            },
            '*'
          );
          setLoading(false);
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
            pluginMessage: { type: MESSAGE_TYPE.BUILD_CHAT_UI, data, style, prompt },
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

  console.log('hasFonts', hasFonts);
  console.log('hasComponentLibrary', hasComponentLibrary);

  if (isLoading) {
    return null;
  }

  if (!hasComponentLibrary) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-[var(--figma-color-bg)]'>
        <div className='flex flex-col items-center px-4 text-center'>
          <Text size='large' className='text-lg font-bold mb-1 text-[var(--figma-color-text)]'>
            Missing Component Library
          </Text>
          <Text className='text-sm text-[var(--figma-color-text-secondary)]'>
            Please make sure you have the iMessage Chat Builder library installed.
          </Text>
        </div>
      </div>
    );
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
