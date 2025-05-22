import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router';
import PluginScreen from './screens/plugin';
import SettingsScreen from './screens/settings';
import { AnthropicProvider } from './context/anthropic';
import { PluginProvider } from './context/plugin';

import './styles/app.css';

const USE_TEST_DATA = true;

function App(): React.JSX.Element {
  return (
    <AnthropicProvider>
      <PluginProvider>
        <MemoryRouter initialEntries={['/PluginScreen']}>
          <Routes>
            <Route path='PluginScreen' element={<PluginScreen useTestData={USE_TEST_DATA} />} />
            <Route path='SettingsScreen' element={<SettingsScreen />} />
          </Routes>
        </MemoryRouter>
      </PluginProvider>
    </AnthropicProvider>
  );
}

export default App;
