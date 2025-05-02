import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import PluginScreen from '../ui/screens/plugin';
import SettingsScreen from '../ui/screens/settings';

import '../ui/styles/app.css';
import '../ui/styles/figma-plugin-ds.css';

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
