import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Institutional Dark Theme v3.3
        graphite: {
          50: '#F5F5F7',
          100: '#E5E5EA',
          200: '#D1D1D6',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
          600: '#3F3F46',
          700: '#2A2A3E',
          800: '#1F1F2E',
          900: '#0B0C10',
        },
        cyan: {
          DEFAULT: '#00E0FF',
          50: '#E5FBFF',
          100: '#CCF7FF',
          200: '#99F0FF',
          300: '#66E8FF',
          400: '#33E1FF',
          500: '#00E0FF',
          600: '#00B3CC',
          700: '#008699',
          800: '#005966',
          900: '#002C33',
        },
        gold: {
          DEFAULT: '#FFB600',
          500: '#FFB600',
          600: '#CC9200',
          700: '#996D00',
        },
        success: {
          DEFAULT: '#00FF88',
          500: '#00FF88',
          600: '#00CC6E',
          400: '#33FFA3',
        },
        danger: {
          DEFAULT: '#FF4444',
          500: '#FF4444',
          600: '#CC3636',
          400: '#FF6666',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 224, 255, 0.3)',
        'glow-cyan-lg': '0 0 40px rgba(0, 224, 255, 0.4)',
        'glow-gold': '0 0 20px rgba(255, 182, 0, 0.3)',
        'glow-success': '0 0 20px rgba(0, 255, 136, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 224, 255, 0.1), 0 2px 4px -1px rgba(0, 224, 255, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 224, 255, 0.2), 0 4px 6px -2px rgba(0, 224, 255, 0.1)',
      },
      backdropBlur: {
        'glass': '16px',
        'modal': '8px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #00FFFF 0%, #FFB600 100%)',
        'gradient-success': 'linear-gradient(135deg, #00FF88 0%, #00E0FF 100%)',
        'gradient-danger': 'linear-gradient(135deg, #FF4444 0%, #FF8844 100%)',
        'gradient-neural': 'linear-gradient(180deg, #0B0C10 0%, #1F1F2E 100%)',
      }
    },
  },
  plugins: [],
}

export default config
