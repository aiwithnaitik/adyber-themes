import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        storm: {
          50: '#f4f6f7',
          100: '#e5e9ec',
          200: '#cbd4da',
          300: '#a6b5c0',
          400: '#7a91a1',
          500: '#5a7384',
          600: '#4f585e', /* Windows Storm */
          700: '#3c474e',
          800: '#2b3338',
          900: '#1b2024',
          950: '#0e1114',
        },
      },
    },
  },
  plugins: [],
}
export default config
