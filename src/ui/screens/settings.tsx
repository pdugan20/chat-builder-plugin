import React from 'react';
import { Text, Link } from 'figma-kit';
import Navigation from '../navigation';
import UpdateKeyDialog from '../components/dialogs/update-key';

interface SettingsScreenProps {
  anthropicKey: string;
  screen?: string;
  pluginVersion?: string;
}

function SettingsScreen({
  anthropicKey,
  screen = 'settings',
  pluginVersion = '1.0',
}: SettingsScreenProps): React.JSX.Element {
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
        <Text>Claude 3.7 Sonnet</Text>
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
        {renderModel()}
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
