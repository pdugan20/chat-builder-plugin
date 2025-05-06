import { Tabs } from 'figma-kit';
import React from 'react';
import { NavLink } from 'react-router-dom';

function Navigation({ screen }) {
  return (
    <nav>
      <Tabs.Root defaultValue={screen}>
        <Tabs.List>
          <Tabs.Trigger value='home'>
            <NavLink to='/PluginScreen'>Home</NavLink>
          </Tabs.Trigger>
          <Tabs.Trigger value='settings'>
            <NavLink to='/SettingsScreen'>Settings</NavLink>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    </nav>
  );
}

export default Navigation;
