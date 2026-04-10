import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS variable tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // Brand palette
        brand: {
          blue: '#002395',
          'blue-mid': '#1a3fad',
          'blue-light': '#4f6ef7',
          red: '#ED2939',
          'red-light': '#f5596a',
          white: '#FFFFFF',
          dark: '#080c1e',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f8f9fc',
          dark: '#0d1117',
          'dark-subtle': '#161b27',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'blue-glow': '0 0 24px rgba(0,35,149,0.25)',
        'red-glow': '0 0 24px rgba(237,41,57,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'ripple': 'ripple 1.5s ease-out infinite',
        'flicker': 'flicker 0.75s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        flicker: {
          '0%, 100%': { transform: 'rotate(-3deg) scale(1)', filter: 'brightness(1)' },
          '33%': { transform: 'rotate(2deg) scale(1.06)', filter: 'brightness(1.1)' },
          '66%': { transform: 'rotate(-1deg) scale(0.97)', filter: 'brightness(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'gradient-french': 'linear-gradient(135deg, #002395 0%, #1a3fad 50%, #ED2939 100%)',
        'gradient-blue': 'linear-gradient(135deg, #002395 0%, #1a3fad 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        'gradient-streak': 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

export default config;
