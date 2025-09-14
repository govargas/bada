import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic tokens from CSS variables
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surfaceMuted: "rgb(var(--color-surface-muted) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        inkMuted: "rgb(var(--color-ink-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        badge: "rgb(var(--color-badge) / <alpha-value>)",

        // Status/quality colors (will generate utilities like text-quality-excellent)
        quality: {
          excellent: "#0B6FB8",
          good: "#147A53",
          sufficient: "#8A6F00",
          poor: "#C43131",
          unknown: "#6B7280",
        },
      },
      fontFamily: {
        spectral: ["Spectral", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tighter2: "-0.06em",
      },
      lineHeight: {
        snugPlus: "1.2",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)",
        cardDark: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
