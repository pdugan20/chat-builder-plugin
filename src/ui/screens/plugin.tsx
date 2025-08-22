import React, { useState } from 'react';
import { Text, Button, Select, Link, Checkbox } from 'figma-kit';
import TextareaAutosize from 'react-textarea-autosize';
import Navigation from '../navigation';
import AlertBanner from '../components/banners/alert';
import promptExamples from '../../constants/prompts';
import { MESSAGE_COUNT_OPTIONS, STYLE_OPTIONS, PARTICIPANT_OPTIONS } from '../../constants/options';
import { useAnthropic } from '../context/anthropic';
import { usePlugin } from '../context/plugin';
import LoadingOverlay from '../components/overlays/loading';
import ApiKeyOverlay from '../components/overlays/api-key';
import DisabledOverlay from '../components/overlays/disabled';
import useChatGeneration from '../hooks/use-chat-generation';
import { getAlertData, getDisabledLinkClass } from '../../utils/alerts';

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
  const { loading, streaming, streamingMessages, generateChat } = useChatGeneration({ anthropicKey, useTestData });
  const [style, setStyle] = useState(defaultStyle);
  const [participants, setParticipants] = useState(defaultParticipants);
  const [maxMessages, setMaxMessages] = useState(defaultMaxMessages);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [includePrototype, setIncludePrototype] = useState(false);

  const isLocalComponentsInitialized = hasLocalComponents !== undefined;

  function renderNav(): React.JSX.Element {
    return <Navigation screen={screen} />;
  }

  function renderAlertBannerAndOverlay(): { banner: React.JSX.Element | null; showDisabledOverlay: boolean } {
    const state = {
      hasComponentLibrary,
      hasLocalComponents,
      hasFonts,
      isLoading: isPluginLoading,
    };

    const alertData = getAlertData(state);
    if (!alertData) {
      return { banner: null, showDisabledOverlay: false };
    }

    return {
      banner: (
        <AlertBanner text={alertData.text} buttonText={alertData.buttonText} onButtonClick={alertData.onButtonClick} />
      ),
      showDisabledOverlay: true,
    };
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
              <Select.Item key={value} value={value}>
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

    const { showDisabledOverlay } = renderAlertBannerAndOverlay();

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
                  className={getDisabledLinkClass(showDisabledOverlay)}
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
              className={getDisabledLinkClass(showDisabledOverlay)}
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

  function renderMoreOptions(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>More options</Text>
        <Checkbox.Root
          defaultChecked={includePrototype}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludePrototype(e.target.checked)}
        >
          <Checkbox.Input />
          <Checkbox.Label>Include prototype</Checkbox.Label>
        </Checkbox.Root>
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
        {renderMoreOptions()}
      </div>
    );
  }

  function renderFooter(): React.JSX.Element {
    const isDisabled = !prompt.trim() || loading;
    
    return (
      <div className='footer'>
        <div className={`transition-opacity duration-200 ${isDisabled ? 'opacity-50' : 'opacity-100'}`}>
          <Button
            variant='primary'
            size='small'
            disabled={isDisabled}
            onClick={() => generateChat({ participants, maxMessages, prompt, style, includePrototype })}
          >
            Generate chat
          </Button>
        </div>
      </div>
    );
  }

  if (isAnthropicLoading || !isLocalComponentsInitialized) {
    return null;
  }

  return (
    <>
      <div className={`${anthropicKey && !isPluginLoading ? 'visible' : 'invisible'} relative`}>
        <div className='fixed inset-x-0 top-0 z-10 bg-[var(--figma-color-bg)]'>{renderNav()}</div>
        <div className='scrollable relative mt-10'>
          {(() => {
            const { banner, showDisabledOverlay } = renderAlertBannerAndOverlay();
            return (
              <>
                {banner}
                <div className='relative'>
                  {showDisabledOverlay && <DisabledOverlay />}
                  <div className={showDisabledOverlay ? 'pointer-events-none' : ''}>
                    {renderBody()}
                    {renderFooter()}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
        {loading && <LoadingOverlay streamingMessages={streaming ? streamingMessages : ''} />}
      </div>
      {!anthropicKey && <ApiKeyOverlay />}
    </>
  );
}

export default PluginScreen;
