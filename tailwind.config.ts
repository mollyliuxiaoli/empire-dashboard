import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable class-based dark mode (future support for light mode)
  theme: {
    extend: {
      colors: {
        // Dark mode colors (default)
        background: "#0a0a0f",
        card: "rgba(255, 255, 255, 0.05)",
        border: "rgba(255, 255, 255, 0.08)",
        gold: "#D4AF37",
        up: "#ef4444",
        down: "#22c55e",

        // Light mode colors (reserved for future use)
        light: {
          background: "#ffffff",
          card: "rgba(0, 0, 0, 0.02)",
          border: "rgba(0, 0, 0, 0.08)",
          text: "#1a1a1a",
          textSecondary: "#666666"
        }
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
