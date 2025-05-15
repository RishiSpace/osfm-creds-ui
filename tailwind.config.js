/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode based on class
  theme: {
    extend: {
      colors: {
        'dark-bg': '#000000', // AMOLED pitch black background
        'dark-card': '#121212', // Slightly lighter black for cards
        'dark-border': '#1f1f1f', // Dark border color
      },
    },
  },
  plugins: [],
};
