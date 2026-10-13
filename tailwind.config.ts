import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — Luxury Optik I See You Palette
        isy: {
          white:          "#FFFFFF",
          ivory:          "#F8F5ED",
          mist:           "#F3F8F4",
          emerald:        "#124734",
          "emerald-hover":"#0C3527",
          "green-deep":   "#124734",
          "green-bright": "#1B4332",
          "text-primary": "#183C30",
          "text-secondary":"#626C65",
          ink:            "#183C30",
          border:         "#E3E7DF",
          line:           "#E3E7DF",
        },
      },
      backgroundImage: {
        "isy-gradient": "linear-gradient(180deg, #F8F5ED 0%, #F8F5ED 100%)",
      },
      fontFamily: {
        // Poppins for modern clean sans & Playfair Display for luxury editorial serif
        sans:       ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        poppins:    ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        serif:      ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        playfair:   ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        'dm-serif': ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        pjs:        ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
