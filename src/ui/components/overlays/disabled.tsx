import React from 'react';

export default function DisabledOverlay(): React.JSX.Element {
  return <div className='absolute inset-0 z-10 bg-[var(--figma-color-bg)] opacity-60' />;
}
