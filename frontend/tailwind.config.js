/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Vibrant light blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          bg: '#111827',      // Very dark gray (not pitch black)
          surface: '#1f2937', // Slightly lighter gray for panels
          border: '#374151'
        },
        light: {
          bg: '#d1fae5',      // Clear, visible mint green (emerald-100)
          surface: '#f4fcf9', // Very soft mint-tinted white to complement the background
          border: '#e2e8f0'   // slate-200
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
