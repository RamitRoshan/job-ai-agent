/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#06040a', // Deeper, premium dark base
        },
        slate: {
          950: '#07070a',
        },
        dark: {
          50: '#a3a3a3',
          100: '#737373',
          200: '#525252',
          300: '#404040',
          400: '#262626',
          500: '#171717',
          600: '#0a0a0a',
          700: '#050505',
        }
      },
      boxShadow: {
        'premium': '0 8px 30px rgb(0 0 0 / 0.5)',
        'premium-hover': '0 20px 40px rgb(0 0 0 / 0.7)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-purple-strong': '0 0 25px rgba(139, 92, 246, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'border-pulse': 'borderPulse 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        borderPulse: {
          '0%, 100%': { borderColor: 'rgba(139, 92, 246, 0.1)' },
          '50%': { borderColor: 'rgba(139, 92, 246, 0.35)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      },
    },
  },
  plugins: [],
}
