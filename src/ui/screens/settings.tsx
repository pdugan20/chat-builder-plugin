import React from 'react';
import Navigation from '../navigation';
import { Title, Textarea, Button, Select } from 'react-figma-plugin-ds';

function SettingsScreen({}) {
  return (
    <div className='px-4 py-1'>
      <Navigation />
      <h1 className='text-xl font-bold'>Page 2...</h1>
      <Title size='large' weight='bold'>
        My plugin
      </Title>

      <Textarea
        className='standard'
        defaultValue=''
        onChange={function _() {}}
        placeholder='Placeholder text...'
        rows={2}
      />
      <Select
        className='standrdDropdown'
        defaultValue='1'
        onChange={function _() {}}
        onExpand={function _() {}}
        options={[
          {
            label: 'Item 1',
            title: 'Item 1 description',
            value: 1,
          },
          {
            label: 'Item 2',
            title: 'Item 2 description',
            value: 2,
          },
        ]}
        placeholder='Placeholder text...'
      />
      <Button>Start</Button>
    </div>
  );
}

export default SettingsScreen;
