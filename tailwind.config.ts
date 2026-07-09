import type { Config } from "tailwindcss";

const config: Config = {
  // darkMode: 'selector',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: { // for climate-focused
          cream: '#F0EAD2',      // page background
          creamAlt: '#DDE5B6',   // card/section background
          ash: '#6C584C',        // primary text
          teal: '#5B8E7D',       // primary accent
          tealHover: '#4a7364',  // accent hover
          copper: '#A98467',     // secondary accent, used sparingly
        },
      fontFamily: {
        // For climate-focused 
        // display: ['"Space Grotesk"', 'sans-serif'],
        // body: ['Inter', 'sans-serif'],
        // mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['var(--font-roboto)'],
        mono: ['var(--font-roboto-mono)'],
      },
      spacing: {
        '50vw': '50vw',
      }
    },
    fontSize: {
      '2.5xl': '1.7rem',
    }
  },
  plugins: [require("daisyui")],
};
export default config;
