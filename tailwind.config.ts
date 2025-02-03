import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#F5F3EF",
        primary: "#000000",
        secondary: "#666666",
        accent: "#FF0000",
      },
      backgroundColor: {
        promo: "#000000",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;