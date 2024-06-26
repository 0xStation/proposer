// tailwind.config.js
module.exports = {
  content: ["{pages,app}/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      "tunnel-black": "#000000",
      "neon-blue": "#5F6FFF",
      "neon-carrot": "#FF9956",
      "magic-mint": "#63EBAF",
      "electric-violet": "#AD72FF",
      concrete: "#646464",
      "wet-concrete": "#2E2E2E",
      "wet-concrete-50": "#121212",
      charcoal: "#1A1A1A",
      "torch-red": "#FF5650",
      "marble-white": "#F2EFEF",
      "light-concrete": "#858585",
    },
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
      lores: ["LoRes9PlusOT", "Monospace"],
      grotesque: ["TerminalGrotesque", "Monospace"],
    },
    extend: {
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
