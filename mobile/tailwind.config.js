/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#f2fed0',
          black: '#0a0a0a',
          white: '#ffffff',
          gray: '#6b7280',
          'green-dark': '#d4f5a0',
        },
      },
    },
  },
  plugins: [],
};
