import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router';
import PluginScreen from './screens/plugin';
import SettingsScreen from './screens/settings';
import { AnthropicProvider } from './context/anthropic';
import { PluginProvider } from './context/plugin';
import { MessengerProvider } from './context/messenger';

import './styles/app.css';

const USE_TEST_DATA = process.env.USE_TEST_DATA === 'true';
const SHOW_DEBUG = process.env.SHOW_DEBUG === 'true';

function App(): React.JSX.Element {
  return (
    <MessengerProvider>
      <AnthropicProvider>
        <PluginProvider>
          <MemoryRouter initialEntries={['/PluginScreen']}>
            <Routes>
              <Route path='PluginScreen' element={<PluginScreen useTestData={USE_TEST_DATA} />} />
              <Route path='SettingsScreen' element={<SettingsScreen showDebug={SHOW_DEBUG} />} />
            </Routes>
          </MemoryRouter>
        </PluginProvider>
      </AnthropicProvider>
    </MessengerProvider>
  );
}

export default App;
