import React, { useState } from 'react';
import { Text, Button, Select, Link } from 'figma-kit';
import TextareaAutosize from 'react-textarea-autosize';
import Navigation from '../navigation';
import AlertBanner from '../components/banners/alert';
import promptExamples from '../../constants/prompts';
import { useAnthropic } from '../context/anthropic';
import { usePlugin } from '../context/plugin';
import LoadingOverlay from '../components/overlays/loading';
import ApiKeyOverlay from '../components/overlays/api-key';
import useChatGeneration from '../hooks/use-chat-generation';
import { showMissingComponentBanner, showMissingFontBanner, handleGetFont, handleGetUIKit } from '../../utils/alerts';

const MESSAGE_COUNT_OPTIONS = ['5', '10', '15', '20'];
const STYLE_OPTIONS = ['light', 'dark'];
const PARTICIPANT_OPTIONS = ['2', '3'];

interface PluginScreenProps {
  screen?: string;
  defaultStyle?: string;
  defaultParticipants?: string;
  defaultMaxMessages?: string;
  defaultPrompt?: string;
  useTestData?: boolean;
}

function PluginScreen({
  screen = 'home',
  defaultStyle = 'light',
  defaultParticipants = '2',
  defaultMaxMessages = '15',
  defaultPrompt = '',
  useTestData = false,
}: PluginScreenProps): React.JSX.Element {
  const { anthropicKey, isLoading: isAnthropicLoading } = useAnthropic();
  const {
    state: { hasComponentLibrary, hasLocalComponents, isLoading: isPluginLoading, hasFonts },
  } = usePlugin();
  const { loading, generateChat } = useChatGeneration({ anthropicKey, useTestData });
  const [style, setStyle] = useState(defaultStyle);
  const [participants, setParticipants] = useState(defaultParticipants);
  const [maxMessages, setMaxMessages] = useState(defaultMaxMessages);
  const [prompt, setPrompt] = useState(defaultPrompt);

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
    return (
      <div className='footer'>
        <Button
          variant='primary'
          size='medium'
          disabled={!prompt.trim() || loading}
          onClick={() => generateChat({ participants, maxMessages, prompt, style })}
        >
          Generate chat
        </Button>
      </div>
    );
  }

  function maybeRenderAlertBanner(): React.JSX.Element | null {
    const state = {
      hasComponentLibrary,
      hasLocalComponents,
      hasFonts,
      isLoading: isPluginLoading,
    };

    if (showMissingComponentBanner(state)) {
      return (
        <AlertBanner
          text={
            <>
              This plugin requires use of the <Link href='#'>iMessage Chat Builder UI Kit</Link>.{' '}
            </>
          }
          buttonText='Get UI kit'
          onButtonClick={handleGetUIKit}
        />
      );
    }

    if (showMissingFontBanner(state)) {
      return (
        <AlertBanner
          text={
            <>
              This plugin requires use of the <Link href='https://developer.apple.com/fonts/'>SF Pro font family</Link>
              .{' '}
            </>
          }
          buttonText='Get font'
          onButtonClick={handleGetFont}
        />
      );
    }

    return null;
  }

  if (isAnthropicLoading) {
    return null;
  }

  return (
    <>
      <div className={`${anthropicKey && !isPluginLoading ? 'visible' : 'invisible'} relative`}>
        <div className='fixed inset-x-0 top-0 z-10 bg-[var(--figma-color-bg)]'>{renderNav()}</div>
        <div className='scrollable mt-10'>
          {maybeRenderAlertBanner()}
          {renderBody()}
          {renderFooter()}
        </div>
        {loading && <LoadingOverlay />}
      </div>
      {!anthropicKey && <ApiKeyOverlay />}
    </>
  );
}

export default PluginScreen;
