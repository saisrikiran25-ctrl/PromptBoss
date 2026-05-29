/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080C10',
          surface: '#0E1318',
          elevated: '#131B22',
          hover: '#1A2530',
        },
        accent: {
          cyan: '#00D4FF',
          'cyan-dim': '#00A8CC',
          'cyan-glow': 'rgba(0,212,255,0.15)',
          amber: '#F5A623',
          'amber-dim': '#D4911D',
        },
        text: {
          primary: '#F0F4F8',
          secondary: '#8A9BAE',
          muted: '#4A5568',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          accent: 'rgba(0,212,255,0.4)',
        },
        status: {
          danger: '#FF4D6D',
          'danger-dim': 'rgba(255,77,109,0.15)',
          success: '#00C98D',
          'success-dim': 'rgba(0,201,141,0.15)',
          warning: '#F5A623',
          'warning-dim': 'rgba(245,166,35,0.15)',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.24s ease-out forwards',
        'fade-in': 'fadeIn 0.24s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typewriter': 'typewriter 0.05s steps(1) forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0,212,255,0.3), 0 0 10px rgba(0,212,255,0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        nav: '16px',
      },
      maxWidth: {
        content: '1100px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.2)',
        'glow-cyan': '0 0 20px rgba(0,212,255,0.4)',
        'glow-amber': '0 0 20px rgba(245,166,35,0.4)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      transitionDuration: {
        '120': '120ms',
      },
    },
  },
  plugins: [],
}
