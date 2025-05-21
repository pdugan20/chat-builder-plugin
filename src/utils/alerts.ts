import { PluginState } from '../ui/context/plugin';

export function showMissingComponentBanner(state: PluginState): boolean {
  return state.hasComponentLibrary === false && state.hasLocalComponents === false;
}

export function showMissingFontBanner(state: PluginState): boolean {
  return !showMissingComponentBanner(state) && state.hasFonts === false;
}

export const handleGetFont = (): void => {
  window.open('https://developer.apple.com/fonts/', '_blank');
};

export const handleGetUIKit = (): void => {
  window.open('#', '_blank');
};
