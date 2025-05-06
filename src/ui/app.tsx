import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import PluginScreen from './screens/plugin';
import SettingsScreen from './screens/settings';

import './styles/app.css';
import 'figma-kit/styles.css';

function App() {
  return (
    <MemoryRouter initialEntries={['/PluginScreen']}>
      <Routes>
        <Route path='PluginScreen' element={<PluginScreen />} />
        <Route path='SettingsScreen' element={<SettingsScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
