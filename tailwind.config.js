/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cc-blue': '#00aeef',
        'cc-red': '#ee283b',
      },
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
}