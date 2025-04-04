/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3498db',
          DEFAULT: '#3498db',
          dark: '#2980b9',
        },
        success: '#2ecc71',
        warning: '#f39c12',
        danger: '#e74c3c',
        info: '#3498db',
        requested: '#f39c12',
        dispatched: '#3498db',
        packed: '#9b59b6',
        returned: '#2ecc71',
        gray: {
          750: '#2d3748', // dark mode hover color
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
