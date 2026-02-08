import { AlertData, ALERT_DATA } from '../constants/alerts';
import { PluginState } from '../ui/context/plugin';

function showMissingComponentBanner(state: PluginState): boolean {
  return !state.hasComponentLibrary && !state.hasLocalComponents && !state.isLoading;
}

function showMissingFontBanner(state: PluginState): boolean {
  return !state.hasFonts && !state.isLoading;
}

export function getAlertData(state: PluginState): AlertData | null {
  if (showMissingComponentBanner(state)) {
    return ALERT_DATA.missingComponent;
  }

  if (showMissingFontBanner(state)) {
    return ALERT_DATA.missingFont;
  }

  return null;
}

export function getDisabledLinkClass(isDisabled: boolean): string {
  return isDisabled ? 'text-[var(--figma-color-text-disabled)]' : '';
}
