import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        arcade: {
          ink: "#060713",
          panel: "#111226",
          cyan: "#22d3ee",
          magenta: "#f472b6",
          lime: "#a3e635",
          red: "#fb7185",
          violet: "#8b5cf6"
        }
      },
      boxShadow: {
        neon: "0 0 24px rgba(34,211,238,0.35), 0 0 72px rgba(244,114,182,0.18)",
        token: "0 0 18px rgba(163,230,53,0.8)"
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.2s ease-in-out infinite",
        reel: "reel 18s linear infinite",
        confetti: "confetti 2.8s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 16px rgba(34,211,238,.35)" },
          "50%": { boxShadow: "0 0 38px rgba(244,114,182,.55)" }
        },
        reel: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        confetti: {
          "0%": { transform: "translateY(-20vh) rotate(0deg)", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(520deg)", opacity: "0" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
