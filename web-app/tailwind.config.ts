// @ts-nocheck
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // v5.1 Smart Terminal Colors
        bg: '#0B0C10',
        surface: '#121317',
        accent: '#00E0FF',
        text: '#EAEAEA',
        success: '#00FF9D',
        danger: '#FF4971',
        warning: '#FFA62B',
        // Legacy colors for compatibility
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // v4 Modern Dark Dashboard Colors
        graphite: {
          50: '#f8f9fb',
          100: '#e9ebef',
          200: '#c9cbd3',
          300: '#a8acb8',
          400: '#70768b',
          500: '#3b3f4d',
          600: '#252831',
          700: '#17191f',
          800: '#0B0C10', // 🔥 Asıl arka plan
          900: '#06070A',
        },
        cyan: {
          glow: '#00FFFF',
          soft: '#00CED1',
        },
        neon: {
          pink: '#FF007F',
          blue: '#00BFFF',
          green: '#00FFAA',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // BIST AI Custom Colors
        'bist-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'bist-cyan': {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        'bist-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // v3.6 UI Overhaul Colors
        'electric': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'neon': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
               800: '#166534',   
          900: '#14532d',
        },
        'graphite': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0A0A0F', // Deep graphite background
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.65rem', { lineHeight: '0.9rem' }], // 10.4px
        'sm': ['0.75rem', { lineHeight: '1.1rem' }], // 12px
        'base': ['0.875rem', { lineHeight: '1.3rem' }], // 14px
        'lg': ['1rem', { lineHeight: '1.4rem' }], // 16px
        'xl': ['1.125rem', { lineHeight: '1.5rem' }], // 18px
        '2xl': ['1.375rem', { lineHeight: '1.7rem' }], // 22px
        '3xl': ['1.625rem', { lineHeight: '1.9rem' }], // 26px
        '4xl': ['2rem', { lineHeight: '2.2rem' }], // 32px
        '5xl': ['2.5rem', { lineHeight: '1' }],
        '6xl': ['3rem', { lineHeight: '1' }],
        '7xl': ['3.5rem', { lineHeight: '1' }],
        '8xl': ['4.5rem', { lineHeight: '1' }],
        '9xl': ['6rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
        // Custom shadows for BIST AI
        'bist': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(59 130 246 / 0.05)',
        'bist-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(59 130 246 / 0.05)',
        'glow': '0 0 20px rgb(59 130 246 / 0.3)',
        'glow-cyan': '0 0 20px rgb(6 182 212 / 0.3)',
        // v4 Modern Dark Dashboard shadows
        'glow-neon': '0 0 10px rgba(0, 255, 170, 0.4)',
        'glow-cyan-soft': '0 0 15px rgba(0, 255, 255, 0.4)',
        // v3.4 Fix Edition shadows
        'glow-smart': '0 0 15px rgba(0, 224, 255, 0.2)',
        'glow-success': '0 0 15px rgba(0, 255, 157, 0.2)',
        'glow-danger': '0 0 15px rgba(255, 73, 113, 0.2)',
        'glow-warning': '0 0 15px rgba(255, 166, 43, 0.2)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'glow-neon': 'glowNeon 2s ease-in-out infinite alternate',
        'pulse-electric': 'pulseElectric 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgb(59 130 246 / 0.5)' },
          '100%': { boxShadow: '0 0 20px rgb(59 130 246 / 0.8)' },
        },
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgb(6 182 212 / 0.5)' },
          '100%': { boxShadow: '0 0 20px rgb(6 182 212 / 0.8)' },
        },
        glowNeon: {
          '0%': { boxShadow: '0 0 5px rgb(34 197 94 / 0.5)' },
          '100%': { boxShadow: '0 0 20px rgb(34 197 94 / 0.8)' },
        },
        pulseElectric: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
               shimmer: {
                 '0%': { transform: 'translateX(-100%)' },
                 '100%': { transform: 'translateX(100%)' },
               },
               // v4 Modern Dark Dashboard keyframes
               'pulse-green': {
                 '0%, 100%': { opacity: '1' },
                 '50%': { opacity: '0.5' },
               },
               'pulse-red': {
                 '0%, 100%': { opacity: '1' },
                 '50%': { opacity: '0.5' },
               },
      },
             backdropBlur: {
               'xs': '2px',
               'glass': '16px',
             },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-bist': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        'gradient-electric': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        'gradient-neon': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-graphite': 'linear-gradient(135deg, #0A0A0F 0%, #1e293b 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Custom plugin for BIST AI components
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-electric': {
          background: 'rgba(14, 165, 233, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
        },
        '.glass-neon': {
          background: 'rgba(34, 197, 94, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
        },
        '.glass-graphite': {
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.gray.100'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.gray.400'),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.gray.500'),
          },
        },
      })
      
      addComponents({
        '.btn-primary': {
          '@apply bg-bist-blue-600 hover:bg-bist-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bist-blue-500 focus:ring-offset-2': {},
        },
        '.btn-secondary': {
          '@apply bg-bist-gray-600 hover:bg-bist-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bist-gray-500 focus:ring-offset-2': {},
        },
        '.btn-success': {
          '@apply bg-success-600 hover:bg-success-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2': {},
        },
        '.btn-warning': {
          '@apply bg-warning-600 hover:bg-warning-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2': {},
        },
        '.btn-error': {
          '@apply bg-error-600 hover:bg-error-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2': {},
        },
        '.btn-electric': {
          '@apply bg-electric-600 hover:bg-electric-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:ring-offset-2 hover:shadow-glow': {},
        },
        '.btn-neon': {
          '@apply bg-neon-600 hover:bg-neon-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 hover:shadow-glow-neon': {},
        },
        '.btn-glass': {
          '@apply glass-electric text-electric-100 font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:bg-electric-500/20 hover:shadow-glow-electric': {},
        },
        '.card': {
          '@apply bg-white rounded-lg shadow-md border border-gray-200 p-6': {},
        },
        '.card-dark': {
          '@apply bg-bist-gray-800 rounded-lg shadow-lg border border-bist-gray-700 p-6': {},
        },
        '.card-glass': {
          '@apply glass-electric rounded-xl shadow-lg border border-electric-500/20 p-6': {},
        },
        '.card-graphite': {
          '@apply glass-graphite rounded-xl shadow-2xl border border-white/10 p-6': {},
        },
        '.card-neon': {
          '@apply glass-neon rounded-xl shadow-lg border border-neon-500/20 p-6': {},
        },
        '.input': {
          '@apply block w-full rounded-md border-gray-300 shadow-sm focus:border-bist-blue-500 focus:ring-bist-blue-500 sm:text-sm': {},
        },
        '.input-dark': {
          '@apply block w-full rounded-md border-bist-gray-600 bg-bist-gray-700 text-white shadow-sm focus:border-bist-blue-500 focus:ring-bist-blue-500 sm:text-sm': {},
        },
        '.input-glass': {
          '@apply block w-full rounded-md glass-electric border-electric-500/30 text-electric-100 shadow-sm focus:border-electric-500 focus:ring-electric-500 sm:text-sm placeholder-electric-300': {},
        },
        '.input-graphite': {
          '@apply block w-full rounded-md glass-graphite border-white/20 text-white shadow-sm focus:border-electric-500 focus:ring-electric-500 sm:text-sm placeholder-gray-400': {},
        },
      })
    },
  ],
  safelist: [
    // Ensure these classes are never purged
    'text-green-500',
    'text-red-500',
    'text-yellow-500',
    'text-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-blue-500',
    'border-green-500',
    'border-red-500',
    'border-yellow-500',
    'border-blue-500',
    'hover:bg-green-600',
    'hover:bg-red-600',
    'hover:bg-yellow-600',
    'hover:bg-blue-600',
    'animate-pulse',
    'animate-spin',
    'animate-bounce',
    'animate-ping',
    'animate-fade-in',
    'animate-fade-out',
    'animate-slide-in',
    'animate-slide-out',
    'animate-bounce-in',
    'animate-pulse-slow',
    'animate-spin-slow',
    'animate-ping-slow',
    'animate-float',
    'animate-glow',
    'animate-glow-cyan',
    'animate-glow-neon',
    'animate-pulse-electric',
    'animate-slide-up',
    'animate-slide-down',
    'animate-scale-in',
               'animate-wiggle',
               'animate-shimmer',
               // v4 Modern Dark Dashboard animations
               'animate-pulseGreen',
               'animate-pulseRed',
    // v3.6 UI Overhaul classes
    'text-electric-500',
    'text-neon-500',
    'text-graphite-950',
    'bg-electric-500',
    'bg-neon-500',
    'bg-graphite-950',
    'border-electric-500',
    'border-neon-500',
    'border-graphite-950',
    'hover:bg-electric-600',
    'hover:bg-neon-600',
    'hover:bg-graphite-900',
    'glass-electric',
    'glass-neon',
    'glass-graphite',
    'btn-electric',
    'btn-neon',
    'btn-glass',
    'card-glass',
    'card-graphite',
    'card-neon',
    'input-glass',
    'input-graphite',
    'gradient-electric',
    'gradient-neon',
    'gradient-graphite',
    'gradient-glass',
    'gradient-glass-dark',
    'shadow-glow',
    'shadow-glow-cyan',
    'shadow-glow-neon',
  ],
  darkMode: 'class',
}

export default config