/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          90: "var(--color-primary-90)",
          10: "var(--color-primary-10)",
        },
      },
    },
  },
  plugins: [],
};
