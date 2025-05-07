import React, { useEffect, useState } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import PluginScreen from './screens/plugin';
import SettingsScreen from './screens/settings';

import './styles/app.css';
import 'figma-kit/styles.css';

function App(): React.JSX.Element {
  const [keyIsValid, setKeyIsValid] = useState(false);

  useEffect(() => {
    onmessage = (event) => {
      const { type } = event.data.pluginMessage;

      if (type === 'hasAnthropicKey') {
        const { hasKey } = event.data.pluginMessage;

        if (hasKey) {
          setKeyIsValid(true);
        }
      }
    };
  }, []);

  return (
    <MemoryRouter initialEntries={['/PluginScreen']}>
      <Routes>
        <Route path='PluginScreen' element={<PluginScreen hasAnthropicKey={keyIsValid} />} />
        <Route path='SettingsScreen' element={<SettingsScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
