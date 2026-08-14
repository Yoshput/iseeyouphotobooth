import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — design.md §2
        isy: {
          white:          "#FFFFFF",
          mist:           "#F3F8F4",
          "green-deep":   "#1B4332",
          "green-bright": "#2FA84F",
          ink:            "#16241C",
          line:           "#E3ECE6",
        },
      },
      backgroundImage: {
        "isy-gradient": "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)",
      },
      fontFamily: {
        // Using CSS custom properties set in globals.css / :root
        sans:  ["var(--font-inter)",     "Inter",            "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)",  "Playfair Display", "Georgia",   "serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
