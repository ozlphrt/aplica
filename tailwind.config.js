/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Pure Neutral Gray (no blue tint) - Minimal
        primary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',   // Main brand color - Pure neutral gray
          600: '#4b5563',   // Hover states
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        
        // Academic tiers - Pure Neutral Gray
        reach: {
          light: 'rgba(156, 163, 175, 0.2)',   // Neutral gray background - minimal
          DEFAULT: '#9ca3af', // Neutral gray
          dark: '#6b7280',    // Darker gray for text
        },
        target: {
          light: 'rgba(107, 114, 128, 0.2)',   // Neutral gray background - balance
          DEFAULT: '#6b7280', // Medium neutral gray
          dark: '#4b5563',    // Dark gray for text
        },
        safety: {
          light: 'rgba(75, 85, 99, 0.2)',   // Dark gray background - security
          DEFAULT: '#4b5563', // Dark neutral gray
          dark: '#374151',    // Darker gray for text
        },
        
        // Financial indicators - Pure Neutral Gray
        affordable: {
          light: 'rgba(107, 114, 128, 0.2)',   // Neutral gray background
          DEFAULT: '#6b7280', // Neutral gray
          dark: '#4b5563',    // Dark gray for text
        },
        expensive: {
          light: 'rgba(75, 85, 99, 0.25)',   // Dark gray background - subtle warning
          DEFAULT: '#4b5563', // Dark neutral gray
          dark: '#374151',    // Darker gray for text
        },
        
        // Semantic colors - Pure Neutral Gray
        success: {
          light: 'rgba(107, 114, 128, 0.15)',
          DEFAULT: '#6b7280', // Neutral gray
          dark: '#4b5563',
        },
        warning: {
          light: 'rgba(156, 163, 175, 0.2)',
          DEFAULT: '#9ca3af', // Neutral gray
          dark: '#6b7280',
        },
        error: {
          light: 'rgba(75, 85, 99, 0.25)',   // Subtle but visible
          DEFAULT: '#4b5563', // Dark neutral gray
          dark: '#374151',
        },
        info: {
          light: 'rgba(107, 114, 128, 0.15)',
          DEFAULT: '#6b7280', // Neutral gray
          dark: '#4b5563',
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

