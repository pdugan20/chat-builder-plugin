import React, { useEffect, useState } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router';
import PluginScreen from './screens/plugin';
import SettingsScreen from './screens/settings';

import './styles/app.css';

const USE_TEST_DATA = true;

function App(): React.JSX.Element {
  const [key, setKey] = useState(null);

  useEffect(() => {
    onmessage = (event) => {
      const { type } = event.data.pluginMessage;

      switch (type) {
        case 'HAS_ANTHROPIC_KEY':
          if (event.data.pluginMessage.hasKey) {
            setKey(event.data.pluginMessage.key);
          }
          break;

        case 'UPDATE_ANTHROPIC_KEY':
          if (event.data.pluginMessage.keyDidUpdate) {
            setKey(event.data.pluginMessage.key);
          }
          break;

        default:
          break;
      }
    };
  }, []);

  return (
    <MemoryRouter initialEntries={['/PluginScreen']}>
      <Routes>
        <Route path='PluginScreen' element={<PluginScreen anthropicKey={key} useTestData={USE_TEST_DATA} />} />
        <Route path='SettingsScreen' element={<SettingsScreen anthropicKey={key} />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
