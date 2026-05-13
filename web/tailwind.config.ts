import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lugia-bg": "#faf9f5",
        "lugia-bg-card": "#ffffff",
        "lugia-bg-soft": "#f5f4ef",
        "lugia-text": "#1a1a1a",
        "lugia-text-secondary": "#595959",
        "lugia-text-tertiary": "#888780",
        "lugia-accent": "#185FA5",
        "lugia-accent-soft": "rgba(24, 95, 165, 0.08)",
        "lugia-border": "rgba(0,0,0,0.15)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
        serif: ["Georgia", '"Times New Roman"', "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
