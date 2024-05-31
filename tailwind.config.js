/** @type {import('tailwindcss').Config} */
module.exports = {
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
  plugins: [],
}