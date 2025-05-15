import { Tabs } from 'figma-kit';
import React from 'react';
import { NavLink } from 'react-router';
import { NavigationProps } from '../types/props';

function Navigation({ screen }: NavigationProps): React.JSX.Element {
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
