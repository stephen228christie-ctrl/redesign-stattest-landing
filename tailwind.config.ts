import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F7F8",
        panel: "#EAEFF1",
        ink: "#14202D",
        "ink-soft": "#4A5B6D",
        plot: "#2547CE",
        sig: "#C32B3E",
        night: "#0F1925",
        "night-soft": "#1A2837",
        line: "rgba(20,32,45,0.12)",
        "line-strong": "rgba(20,32,45,0.25)",
      },
      fontFamily: {
        display: ["Spectral", "Georgia", "serif"],
        body: ["Atkinson Hyperlegible", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      maxWidth: { wrap: "76rem" },
    },
  },
  plugins: [],
};
export default config;
