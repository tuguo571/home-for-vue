import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
          10: "var(--color-primary-10)",
        },
      },
      backgroundColor: {
        main: "var(--color-bg-main)",
        secondary: "var(--color-bg-secondary)",
        tertiary: "var(--color-bg-tertiary)",
      },
      textColor: {
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        tertiary: "var(--color-text-tertiary)",
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
        light: "var(--color-border-light)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
      },
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
