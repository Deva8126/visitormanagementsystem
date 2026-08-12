/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corporate: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7ccafd',
          400: '#38aef9',
          500: '#0e92eb',
          600: '#0273ca',
          700: '#035ca3',
          800: '#074e87',
          900: '#0c4270',
          950: '#082a4a',
        }
      }
    },
  },
  plugins: [],
}
