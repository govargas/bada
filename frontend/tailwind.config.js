import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      letterSpacing: {
        // Photoshop tracking -75 → -0.075em
        "tight-075": "-0.075em",
      },
      lineHeight: {
        // 32px on 16px base
        32: "2rem",
      },
      fontFamily: {
        serif: ['"Spectral"', "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        sand: { 50: "#f7f4ee", 100: "#efebe4", 200: "#e6e0d6" },
        ink: { 900: "#1d1a1a", 950: "#161011" },
        card: { light: "#ffffff", dark: "#1b1617" },
        line: "#ded6cb",
        lineDark: "#2a2224",
        accent: {
          teal: "#1e6a73",
          tealBg: "#e2f1f3",
          cyan: "#2a7f97",
          cyanBg: "#e4f2f7",
          gold: "#a9823a",
          goldBg: "#f6efe2",
          red: "#bb3a3a",
          redBg: "#f9e7e7",
          // dark tints
          tealBgD: "#163c40",
          cyanBgD: "#163a47",
          goldBgD: "#3d2f16",
          redBgD: "#4a1c1c",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.06)",
        softDark: "0 1px 2px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.35)",
      },
      borderRadius: { card: "12px" },
    },
  },
  plugins: [],
};

export default config;
