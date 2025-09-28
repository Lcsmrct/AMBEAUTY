/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(0, 85%, 59%)',
          foreground: 'hsl(0, 0%, 98%)'
        },
        secondary: {
          DEFAULT: 'hsl(0, 0%, 87%)',
          foreground: 'hsl(222, 75%, 10%)'
        },
        accent: {
          DEFAULT: 'hsl(0, 0%, 90%)',
          foreground: 'hsl(222, 60%, 15%)',
          gold: 'hsl(48, 100%, 52%)'
        },
        background: 'hsl(0, 0%, 97%)',
        foreground: 'hsl(222, 75%, 10%)',
        muted: {
          DEFAULT: 'hsl(0, 0%, 89%)',
          foreground: 'hsl(222, 40%, 25%)'
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 95%)',
          foreground: 'hsl(222, 75%, 10%)'
        },
        destructive: {
          DEFAULT: 'hsl(0, 84%, 60%)',
          foreground: 'hsl(0, 0%, 98%)'
        },
        border: 'hsl(0, 0%, 88%)',
        input: 'hsl(0, 0%, 80%)',
        ring: 'hsl(0, 85%, 59%)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      borderRadius: {
        DEFAULT: '0.5rem'
      },
      boxShadow: {
        'elevate': '0px 2px 0px 0px hsl(0 0% 0% / 0.03), 0px 1px 2px -1px hsl(0 0% 0% / 0.04)',
        'elevate-md': '0px 2px 0px 0px hsl(0 0% 0% / 0.04), 0px 2px 4px -1px hsl(0 0% 0% / 0.05)',
        'elevate-lg': '0px 2px 0px 0px hsl(0 0% 0% / 0.04), 0px 4px 6px -1px hsl(0 0% 0% / 0.06)',
        'elevate-xl': '0px 2px 0px 0px hsl(0 0% 0% / 0.05), 0px 8px 10px -1px hsl(0 0% 0% / 0.08)'
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-slow': 'bounce 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}