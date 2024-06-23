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
      xxs: "360px",
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      xxl: "1536px",
      fileTextXL: "1600px",
      fileTextLG: "1400px",
      fileTextMD: "1200px",
      fileTextSM: "1000px",
      fileTextXSM: "900px",
      fileListShowDetails: "680px",
      mobileMode: "1100px",
    },
  },
  plugins: [],
};
