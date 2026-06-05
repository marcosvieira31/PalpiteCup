import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e",
        accent: "#facc15",
        navy: "#1e3a8a",
        background: "#f8fafc",
        foreground: "#0f172a",
      },
      fontFamily: {
        bebas: ["var(--font-bebas-neue)", "sans-serif"],
        sans: ["var(--font-barlow)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
