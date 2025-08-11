import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0ea5e9", dark: "#0284c7", light: "#38bdf8" },
      },
      boxShadow: { soft: "0 6px 24px rgba(0,0,0,0.08)" },
      borderRadius: { xl: "0.875rem", '2xl': "1.25rem" },
    },
  },
  plugins: [],
}
export default config
