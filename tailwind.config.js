/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        netflix: {
          50: "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc7c7",
          300: "#ffa0a0",
          400: "#ff6b6b",
          500: "#f53b3b",
          600: "#E50914",
          700: "#c70812",
          800: "#a40a12",
          900: "#870f16",
          950: "#4a0407",
        },
        "netflix-dark": {
          50: "#f5f5f5",
          100: "#e5e5e5",
          200: "#cccccc",
          300: "#b3b3b3",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4d4d4d",
          800: "#333333",
          900: "#1a1a1a",
          950: "#141414",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        neon: {
          pink: "#ff0080",
          purple: "#9333ea",
          cyan: "#06b6d4",
          lime: "#84cc16",
          orange: "#fb923c",
        },
      },
      fontFamily: {
        sans: ["Inter var", "system-ui", "-apple-system", "sans-serif"],
        display: ["Bebas Neue", "Impact", "sans-serif"],
        cinema: ["Oswald", "sans-serif"],
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-in-out",
        "fade-out": "fade-out 0.5s ease-in-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        shimmer: "shimmer 2s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "marquee-fast": "marquee 20s linear infinite",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "fade-in-down": "fadeInDown 0.4s ease-out",
        "zoom-in": "zoomIn 0.3s ease-out",
        "zoom-out": "zoomOut 0.3s ease-out",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "fade-out": { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(229, 9, 20, 0.5)" },
          "100%": {
            boxShadow:
              "0 0 30px rgba(229, 9, 20, 0.8), 0 0 40px rgba(229, 9, 20, 0.6)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeInDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        zoomOut: {
          "0%": { transform: "scale(1.2)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "cinema-gradient":
          "linear-gradient(135deg, #E50914 0%, #B20710 50%, #4a0407 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
        "neon-gradient":
          "linear-gradient(135deg, #ff0080 0%, #9333ea 50%, #06b6d4 100%)",
        "dark-overlay":
          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
        "netflix-hero": "linear-gradient(135deg, #E50914 0%, #B20710 100%)",
        "netflix-dark-bg": "linear-gradient(180deg, #141414 0%, #1a1a1a 100%)",
        "glass-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
        "netflix-glow": "linear-gradient(135deg, #E50914 0%, #B20710 100%)",
        "dark-red": "linear-gradient(135deg, #141414 0%, #E50914 100%)",
      },
      boxShadow: {
        cinema: "0 0 40px rgba(229, 9, 20, 0.4)",
        netflix: "0 0 30px rgba(229, 9, 20, 0.5)",
        gold: "0 0 30px rgba(245, 158, 11, 0.4)",
        glow: "0 0 30px rgba(229, 9, 20, 0.6)",
        "inner-glow": "inset 0 0 20px rgba(229, 9, 20, 0.3)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};
