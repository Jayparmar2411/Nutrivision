/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0f172a',
          primary: '#10b981', // Emerald 500
          accent: '#3b82f6',  // Blue 500
          glow: '#34d399',
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        scan: {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        }
      }
    },
  },
  plugins: [],
}