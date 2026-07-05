import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cellar: {
          ink: "#201715",
          night: "#171211",
          oak: "#8E6048",
          walnut: "#4B3029",
          cream: "#F6EFE1",
          parchment: "#FBF7ED",
          gold: "#C7A25A",
          moss: "#637456",
          slate: "#4E5B5B"
        },
        burgundy: {
          50: "#FBF2F4",
          100: "#F5DEE3",
          300: "#D48998",
          500: "#8F1D3A",
          700: "#65142C",
          900: "#3B0C1B"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      boxShadow: {
        cellar: "0 24px 70px rgba(32, 23, 21, 0.18)",
        soft: "0 12px 36px rgba(63, 41, 35, 0.12)"
      }
    }
  },
  plugins: [animate]
};

export default config;
