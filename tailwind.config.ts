import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#030712",
          900: "#0b1220",
          800: "#111c2e",
        },
        accent: "#22c55e",
      },
    },
  },
  plugins: [],
};

export default config;
