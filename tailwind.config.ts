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
        // Design tokens — design.md §2
        isy: {
          white:          "#FFFFFF",
          ivory:          "#FAF6EC",
          mist:           "#F3F8F4",
          "green-deep":   "#1B4332",
          "green-bright": "#2FA84F",
          ink:            "#16241C",
          line:           "#E3ECE6",
        },
      },
      backgroundImage: {
        "isy-gradient": "linear-gradient(180deg, #FAF6EC 0%, #FAF6EC 100%)",
      },
      fontFamily: {
        // Using Plus Jakarta Sans for clean commercial aesthetic
        sans:  ["var(--font-pjs)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        pjs:   ["var(--font-pjs)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-pjs)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        'dm-serif': ['var(--font-pjs)', "Plus Jakarta Sans", 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
