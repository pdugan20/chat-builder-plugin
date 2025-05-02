/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'fc-text-brand': 'var(--figma-color-text-brand)',
      },
      fontSize: {
        sm: ['14px', '20px'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
  darkMode: ['class', '.figma-dark'],
};
