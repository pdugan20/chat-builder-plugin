import figmaKitPreset from './src/ui/styles/figma-tailwind-preset.js';

/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,ts,tsx}'],
  presets: [figmaKitPreset],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
  darkMode: ['class', '.figma-dark'],
};
