import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0A0E21", surface: "#141A35", card: "#1A2145", border: "#2C3765" },
        royal: "#8B5CF6",
        gold: { light: "#FFE082", DEFAULT: "#FFB300", deep: "#FF8F00" },
        cyan: "#22D3EE",
        emeraldx: "#10B981",
        hot: "#FF6D3F",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(255, 179, 0, 0.35)",
        "glow-purple": "0 0 24px -4px rgba(139, 92, 246, 0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
