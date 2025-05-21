import { AlertData, ALERT_DATA } from '../constants/alerts';
import { PluginState } from '../ui/context/plugin';
import URLS from '../constants/urls';

export function showMissingComponentBanner(state: PluginState): boolean {
  return !state.hasComponentLibrary && !state.hasLocalComponents && !state.isLoading;
}

export function showMissingFontBanner(state: PluginState): boolean {
  return !state.hasFonts && !state.isLoading;
}

export function getAlertData(state: PluginState): AlertData | null {
  if (showMissingComponentBanner(state)) {
    return ALERT_DATA.missingComponent;
  }

  if (!showMissingFontBanner(state)) {
    return ALERT_DATA.missingFont;
  }

  return null;
}

export function getDisabledLinkClass(isDisabled: boolean): string {
  return isDisabled ? 'text-[var(--figma-color-text-disabled)]' : '';
}

export const handleGetFont = (e?: React.MouseEvent): void => {
  if (e) {
    e.preventDefault();
  }
  window.open(URLS.SF_PRO_FONTS, '_blank');
};

export const handleGetUIKit = (e?: React.MouseEvent): void => {
  if (e) {
    e.preventDefault();
  }
  window.open(URLS.UI_KIT, '_blank');
};
