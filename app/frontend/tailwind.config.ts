import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0B0B0D',
          surface:  '#0F1113',
          elevated: '#151719',
          subtle:   '#1B1D20',
        },
        border: {
          DEFAULT: '#26282B',
          muted:   '#1E2023',
          strong:  '#3A3D42',
        },
        text: {
          primary:   '#E6E9EB',
          secondary: '#A6ADB3',
          tertiary:  '#666D75',
          inverse:   '#0B0B0D',
        },
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        status: {
          error:   '#FF5C5C',
          success: '#22C55E',
          warning: '#F59E0B',
          info:    '#38BDF8',
        },
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          50:  '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          DEFAULT: '#0F1113',
          card:    '#151719',
          dark:    '#0B0B0D',
          'dark-card': '#0F1113',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'display':    ['clamp(2.25rem,5vw,3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(1.75rem,3.5vw,2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0/0.4),0 1px 2px -1px rgb(0 0 0/0.3)',
        'card-hover': '0 8px 32px 0 rgb(0 0 0/0.5),0 2px 8px -2px rgb(0 0 0/0.4)',
        'glow-teal':  '0 0 20px 0 rgb(20 184 166/0.25)',
        'panel':      '0 0 0 1px #26282B,0 4px 16px 0 rgb(0 0 0/0.5)',
      },
      animation: {
        'fade-up':    'fadeUp 0.32s cubic-bezier(.2,.9,.2,1) forwards',
        'fade-in':    'fadeIn 0.25s ease forwards',
        'shimmer':    'shimmer 1.8s linear infinite',
        'live-pulse': 'livePulse 2s ease-in-out infinite',
        'hero-float': 'heroFloat 10s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        livePulse: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.5', transform: 'scale(0.9)' } },
        heroFloat: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      transitionTimingFunction: { spring: 'cubic-bezier(.2,.9,.2,1)' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
