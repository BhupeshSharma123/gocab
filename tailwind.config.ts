import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#F5C518", dark: "#D4A800", light: "#FFD64A" },
        border: "hsl(var(--border))", input: "hsl(var(--input))",
        ring: "hsl(var(--ring))", background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "#000000", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#F5F5F5", foreground: "#000000" },
        destructive: { DEFAULT: "#DC2626", foreground: "#FFFFFF" },
        muted: { DEFAULT: "#F5F5F5", foreground: "#737373" },
        accent: { DEFAULT: "#F5C518", foreground: "#000000" },
        card: { DEFAULT: "#FFFFFF", foreground: "#000000" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#000000" },
      },
      borderRadius: { lg: "0.75rem", md: "0.5rem", sm: "0.375rem" },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "monospace"] },
    },
  },
  plugins: [],
};
export default config;
