import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // toggle by adding/removing `class="dark"` on <html>
  theme: {
    extend: {
      // Semantic color tokens mapped to CSS variables for light/dark mode
      colors: {
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surfaceMuted: "rgb(var(--color-surface-muted) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        inkMuted: "rgb(var(--color-ink-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)", // links/buttons
        badge: "rgb(var(--color-badge) / <alpha-value>)",

        // Quality/status (picked for AA contrast on both themes)
        quality: {
          excellent: "#0B6FB8", // accessible blue
          good: "#147A53", // accessible green
          sufficient: "#8A6F00", // amber with contrast
          poor: "#C43131", // accessible red
          unknown: "#6B7280", // neutral gray
        },
      },
      fontFamily: {
        spectral: ["Spectral", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        // Title “BADA” tracking ≈ -0.06em looks like the UI mockup
        tighter2: "-0.06em",
      },
      lineHeight: {
        snugPlus: "1.2", // for the 2-line subtitle fitting next to the logo
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
