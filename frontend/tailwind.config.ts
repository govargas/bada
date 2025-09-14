import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          100: "#f5f0e8", // light beige background
        },
        ink: {
          900: "#1a1a1a", // near black for text
          950: "#0d0d0d", // darkest background for dark mode
        },
        quality: {
          excellent: "#0077b6", // blue
          poor: "#d62828", // red
        },
      },
      fontFamily: {
        spectral: ["Spectral", "serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
