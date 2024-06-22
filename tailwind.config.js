/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
    screens: {
      quickAccessOne: "1000px",
      quickAccessTwo: "1210px",
      quickAccessThree: "1420px",
      quickAccessFour: "1600px",
    },
  },
  plugins: [],
};
