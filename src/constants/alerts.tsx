import React, { JSX } from 'react';
import { Link } from 'figma-kit';
import URLS from './urls';

export interface AlertData {
  text: JSX.Element;
  buttonText: string;
  onButtonClick: () => void;
}

export const ALERT_DATA = {
  missingComponent: {
    text: (
      <>
        This plugin requires use of the{' '}
        <Link href={URLS.UI_KIT} target='_blank'>
          iMessage Chat Builder UI Kit
        </Link>
        .{' '}
      </>
    ),
    buttonText: 'Get UI kit',
    onButtonClick: () => window.open(URLS.UI_KIT, '_blank'),
  },
  missingFont: {
    text: (
      <>
        This plugin requires use of the{' '}
        <Link href={URLS.SF_PRO_FONTS} target='_blank'>
          SF Pro font family
        </Link>
        .{' '}
      </>
    ),
    buttonText: 'Get font',
    onButtonClick: () => window.open(URLS.SF_PRO_FONTS, '_blank'),
  },
} satisfies Record<string, AlertData>;
