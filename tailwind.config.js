const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["var(--font-montserrat)", ...defaultTheme.fontFamily.sans],
    },
    extend: {
      dropShadow: {
        cta: ["0 10px 15px rgba(219, 227, 248, 0.2)"],
        blue: ["0 10px 15px rgba(59, 130, 246, 0.2)"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
