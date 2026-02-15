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
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Electric Indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Cyber Cyan
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: '#F43F5E', // Rose/Neon Red for alerts/highlights
        dark: {
          50: '#f6f7f9',
          100: '#ecedf0',
          200: '#d0d3d9',
          300: '#b4b9c2',
          400: '#98a0ab',
          500: '#7c8694',
          600: '#606c7d',
          700: '#445266', // Muted slate
          800: '#28384f', // Deep Navy
          900: '#0B0C10', // Void Black (Main BG)
          950: '#050608', // Abyssal Black
        },
        surface: {
          light: '#ffffff',
          dark: '#1F2937', // Gray-800
          darker: '#111827', // Gray-900
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Poppins', 'system-ui', 'sans-serif'], // 'Outfit' is great for tech
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)', // Indigo to Cyan
        'gradient-dark': 'linear-gradient(180deg, #0B0C10 0%, #1F2937 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, rgba(11, 12, 16, 0) 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
        'glow-md': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 30px rgba(14, 165, 233, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
