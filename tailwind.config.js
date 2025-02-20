/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3c85ee",
        "primary-hover": "#326bcc",
        "white-hover": "#f6f5fd",
        "gray-primary": "#637381",
        "gray-secondary": "#e8eef2",
        "gray-third": "#ebe9f9",
        "light-primary": "rgba(60, 133, 238, 0.4)",
      },
    },
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
      desktopMode: "1100px",
    },
  },
  plugins: [],
};
