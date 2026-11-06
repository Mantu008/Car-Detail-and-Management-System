/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary brand scale: a confident electric blue used for primary actions, links, focus and active states.
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bdd3ff',
          300: '#90b6ff',
          400: '#5c8dfd',
          500: '#3767f8',
          600: '#2149ed',
          700: '#1a37d9',
          800: '#1c2fb0',
          900: '#1d2e8a',
          950: '#161d54',
        },
        // Deep navy used for dark surfaces (hero, auth panel, admin sidebar).
        ink: {
          800: '#111a33',
          900: '#0b1226',
          950: '#070c1a',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.05)',
        'card-hover': '0 12px 32px -12px rgb(15 23 42 / 0.18), 0 2px 6px -2px rgb(15 23 42 / 0.06)',
        pop: '0 16px 40px -12px rgb(15 23 42 / 0.28)',
        glow: '0 0 0 1px rgb(255 255 255 / 0.08), 0 30px 80px -20px rgb(33 73 237 / 0.55)',
        'btn-brand': '0 1px 2px 0 rgb(33 73 237 / 0.3), inset 0 1px 0 0 rgb(255 255 255 / 0.15)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2149ed 0%, #3767f8 45%, #22d3ee 100%)',
        'grid-light':
          'linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: 0, transform: 'translateY(6px) scale(0.98)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'fade-up': 'fade-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in': 'pop-in 160ms ease-out',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
