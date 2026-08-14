/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#effcf8', 500: '#0f9f79', 600: '#078664', 700: '#076c52' },
      },
    },
  },
  plugins: [],
};
