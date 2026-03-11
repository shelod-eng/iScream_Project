/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        iscream: {
          primary: '#1C66B8',
          dark: '#0E3F91',
          purple: '#4C4ACF',
          teal: '#0F8F7D',
          green: '#1C8F3A',
          bg: '#F4F6FA',
          text: '#0F172A'
        },
      },
    },
  },
  plugins: [],
};
