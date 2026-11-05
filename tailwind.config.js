/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bota: {
          bg: "#14120F",
          surface: "#1C1915",
          border: "#2A251F",
          coral: "#FF6B45",
          coralHover: "#E85E3A",
          gold: "#E8B04B",
          text: "#F5F1EA",
          muted: "#9B948A",
          success: "#4ADE80",
          error: "#F2555C",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)"],
        body: ["var(--font-space)"],
      },
    },
  },
  plugins: [],
};
