import React from 'react';
import { Text, Link } from 'figma-kit';
import Navigation from '../navigation';
import UpdateKeyDialog from '../components/dialogs/update-key';

const screen = 'settings';
const pluginVersion = '1.0';

function SettingsScreen({ anthropicKey }): React.JSX.Element {
  function renderNav(): React.JSX.Element {
    return <Navigation screen={screen} />;
  }

  function renderKey(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Anthropic API key</Text>
        <UpdateKeyDialog title='Add key' anthropicKey={anthropicKey} />
      </div>
    );
  }

  function renderVersionNumber(): React.JSX.Element {
    return (
      <div className='row-item'>
        <Text className='heading'>Version</Text>
        <Text>{pluginVersion}</Text>
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
