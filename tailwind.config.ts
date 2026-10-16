import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-manrope)",
          "var(--font-noto-devanagari)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        // 1. Forest Green: Calm, authoritative, lush agricultural primary
        forest: {
          50: "#F1F7F4",
          100: "#E1EFE7",
          200: "#C3DFCF",
          300: "#98C8AF",
          400: "#67AA8B",
          500: "#3D8C6C",
          600: "#2D6A4F", // Premium calm forest
          700: "#22533E",
          800: "#1B4332", // Deep brand anchor
          900: "#133125",
          950: "#091913",
        },
        // 2. Cream & Canvas: Warm parchment background avoiding sterile cold gray/white
        cream: {
          50: "#FDFBF7", // Sunlight canvas
          100: "#F7F3EA", // Warm card surface
          200: "#EFE8DC", // Subtle border
          300: "#DFD3BF",
          400: "#C7B59B",
          500: "#AD977B",
          600: "#8D785D",
          700: "#6E5C46",
          800: "#4F4132",
          900: "#332A20",
        },
        // 3. Soil & Terracotta: Fertile grounded earth accents
        soil: {
          50: "#FAF6F2",
          100: "#F3ECE3",
          200: "#E5D7C7",
          300: "#D3BDA4",
          400: "#BA9C7D",
          500: "#9C7C5B",
          600: "#806041",
          700: "#65492E", // Fertile black/brown cotton soil
          800: "#4B341F",
          900: "#332213",
        },
        // 4. Harvest Gold: Sunlit crops, grain, and high-value mandi numbers
        harvest: {
          50: "#FEF9EE",
          100: "#FCF0D3",
          200: "#F8DEA5",
          300: "#F4C76D",
          400: "#EEAC37",
          500: "#DF9115", // Rich ripe wheat
          600: "#BD730B",
          700: "#935508",
          800: "#6C3C06",
          900: "#482603",
        },
        // Legacy 'kisan' tokens preserved for backward compatibility
        kisan: {
          green: {
            50: "#F1F8E9",
            100: "#DCEDC8",
            200: "#C5E1A5",
            300: "#AED581",
            400: "#9CCC65",
            500: "#4CAF50",
            600: "#388E3C",
            700: "#2E7D32",
            800: "#1B5E20",
            900: "#0F3813",
          },
          soil: {
            50: "#EFEBE9",
            100: "#D7CCC8",
            200: "#BCAAA4",
            300: "#A1887F",
            400: "#8D6E63",
            500: "#795548",
            600: "#6D4C41",
            700: "#5D4037",
            800: "#4E342E",
            900: "#3E2723",
          },
          amber: {
            50: "#FFF8E1",
            100: "#FFECB3",
            500: "#FFB300",
            700: "#FFA000",
            800: "#FF8F00",
            900: "#E65100",
          },
          gold: {
            500: "#FBC02D",
            600: "#F9A825",
            700: "#F57F17",
          },
        },
      },
      screens: {
        xs: "360px", // Baseline Indian rural Android phone width
      },
      boxShadow: {
        card: "0 2px 14px -2px rgba(27, 67, 50, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
        elevated: "0 10px 30px -4px rgba(27, 67, 50, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.05)",
        floating: "0 14px 40px -6px rgba(20, 50, 36, 0.18)",
        gold: "0 4px 20px -2px rgba(223, 145, 21, 0.25)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      minHeight: {
        touch: "48px",
        button: "52px",
      },
      minWidth: {
        touch: "48px",
        button: "52px",
      },
    },
  },
  plugins: [],
};

export default config;
