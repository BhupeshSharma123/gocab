import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // UI-UX-Pro-Max: Ride Hailing palette — Map dark + route blue
        brand: { DEFAULT: "#2563EB", light: "#3B82F6", dark: "#1D4ED8", glow: "rgba(37,99,235,0.4)" },
        surface: { DEFAULT: "#0F172A", elevated: "#1E293B", overlay: "rgba(15,23,42,0.85)" },
        border: "rgba(255,255,255,0.08)",
        muted: { DEFAULT: "#334155", foreground: "#94A3B8" },
        accent: { DEFAULT: "#2563EB", foreground: "#FFFFFF" },
        destructive: { DEFAULT: "#DC2626", foreground: "#FFFFFF" },
        success: { DEFAULT: "#22C55E", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#F59E0B", foreground: "#000000" },
        background: "#0F172A",
        foreground: "#FFFFFF",
        card: { DEFAULT: "#1E293B", foreground: "#FFFFFF" },
        popover: { DEFAULT: "#1E293B", foreground: "#FFFFFF" },
        primary: { DEFAULT: "#2563EB", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#334155", foreground: "#FFFFFF" },
        input: "#1E293B",
        ring: "#2563EB",
      },
      borderRadius: { lg: "1rem", md: "0.75rem", sm: "0.5rem", xl: "1.25rem", "2xl": "1.75rem" },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "monospace"] },
      animation: {
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
export default config;
