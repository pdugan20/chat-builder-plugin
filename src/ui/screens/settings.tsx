import React from 'react';
import { Text, Link } from 'figma-kit';
import Navigation from '../navigation';
import UpdateKeyDialog from '../components/dialogs/update-key';
import { useAnthropic } from '../context/anthropic';
import URLS from '../../constants/urls';
import PLUGIN_VERSION from '../../constants/plugin';
import { MESSAGE_TYPE } from '../../constants/messages';

interface SettingsScreenProps {
  screen?: string;
  pluginVersion?: string;
  showDebug?: boolean;
}

function SettingsScreen({
  screen = 'settings',
  pluginVersion = PLUGIN_VERSION,
  showDebug = false,
}: SettingsScreenProps): React.JSX.Element {
  const { anthropicKey } = useAnthropic();

  function renderNav(): React.JSX.Element {
    return <Navigation screen={screen} />;
  }

  function renderKeyBody(): React.JSX.Element {
    if (!anthropicKey) {
      return <UpdateKeyDialog dialogTitle='Add key' anthropicKey={anthropicKey} />;
    }
    return <Text className='subtitle truncated'>{anthropicKey}</Text>;
  }

  function renderKey(): React.JSX.Element {
    return (
      <div className='row-item'>
        <div className='heading-parent'>
          <Text className='heading'>Anthropic API key</Text>
          {anthropicKey && <UpdateKeyDialog dialogTitle='Edit key' actionLabel='Edit' anthropicKey={anthropicKey} />}
        </div>
        {renderKeyBody()}
      </div>
    );
  }

  function renderVersionNumber(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Plugin version</Text>
        <Text>{pluginVersion}</Text>
      </div>
    );
  }

  function renderModel(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Model</Text>
        <Text>Claude 3.5 Sonnet</Text>
      </div>
    );
  }

  function renderFeedbackLink(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Feedback</Text>
        <Link href={URLS.GITHUB_ISSUES} target='_blank' rel='noopener noreferrer'>
          Report a bug
        </Link>
      </div>
    );
  }

  function renderDebugSection(): React.JSX.Element | null {
    // Only show when showDebug flag is true
    if (!showDebug) {
      return null;
    }

    const clearClientStorage = () => {
      parent.postMessage(
        {
          pluginMessage: {
            type: MESSAGE_TYPE.CLEAR_CLIENT_STORAGE,
          },
        },
        '*'
      );
    };

    return (
      <div className='row-item'>
        <Text className='heading'>Debug</Text>
        <Link
          href='#'
          onClick={(e) => {
            e.preventDefault();
            clearClientStorage();
          }}
          style={{ color: 'var(--figma-color-text-danger)' }}
        >
          Clear clientStorage
        </Link>
      </div>
    );
  }

  function renderBody(): React.JSX.Element {
    return (
      <div className='body'>
        {renderVersionNumber()}
        {renderKey()}
        {renderModel()}
        {renderFeedbackLink()}
        {renderDebugSection()}
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
