/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Subtle Blue (trust, education) - Muted tones
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',   // Main brand color - Muted blue-gray
          600: '#486581',   // Hover states
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        
        // Academic tiers - Semantic colors matching meaning
        reach: {
          light: 'rgba(196, 181, 253, 0.4)',   // Purple background - ambition, prestige
          DEFAULT: '#a78bfa', // Medium purple/violet
          dark: '#7c3aed',    // Dark purple for text - better contrast
        },
        target: {
          light: 'rgba(103, 232, 249, 0.4)',   // Cyan/Teal background - balance, harmony
          DEFAULT: '#06b6d4', // Medium cyan/teal
          dark: '#0891b2',    // Dark cyan for text - better contrast
        },
        safety: {
          light: 'rgba(191, 219, 254, 0.4)',   // Blue background - security, confidence
          DEFAULT: '#6b9dc4', // Medium blue
          dark: '#3d5f7a',    // Dark blue for text - better contrast
        },
        
        // Financial indicators - Semantic colors
        affordable: {
          light: 'rgba(134, 239, 172, 0.4)',   // Green background - financial security
          DEFAULT: '#4ade80', // Medium green (distinct from target)
          dark: '#16a34a',    // Dark green for text
        },
        expensive: {
          light: 'rgba(254, 202, 202, 0.45)',   // Red background - more visible for critical
          DEFAULT: '#d47d7d', // Medium red
          dark: '#9c4a4a',    // Dark red for text - better contrast
        },
        
        // Semantic colors - Subtle except for critical
        success: {
          light: 'rgba(167, 243, 208, 0.2)',
          DEFAULT: '#6b9b7a', // Muted green
          dark: '#5a8570',
        },
        warning: {
          light: 'rgba(251, 211, 141, 0.2)',
          DEFAULT: '#c9a961', // Muted amber
          dark: '#a68b4f',
        },
        error: {
          light: 'rgba(254, 202, 202, 0.3)',   // Slightly more visible for critical
          DEFAULT: '#dc5f5f', // More visible red for critical messages
          dark: '#c44a4a',
        },
        info: {
          light: 'rgba(191, 219, 254, 0.2)',
          DEFAULT: '#5b8db8', // Muted blue
          dark: '#4a7396',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      screens: {
        sm: '640px',   // Large phones
        md: '768px',   // Tablets
        lg: '1024px',  // Laptops
        xl: '1280px',  // Desktops
        '2xl': '1536px', // Large desktops
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

