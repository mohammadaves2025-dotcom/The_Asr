/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#122837',
          'navy-dark': '#0d1e29',
          'navy-light': '#1a3a4f',
          yellow: '#FBFC09',
          'yellow-dark': '#e0e108',
        },
        sidebar: {
          bg: '#0d1e29',
          hover: '#1a3a4f',
          active: '#122837',
          border: 'rgba(251,252,9,0.1)',
          text: 'rgba(255,255,255,0.7)',
          'text-active': '#FBFC09',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          dark: '#0d1a22',
        },
        ink: {
          DEFAULT: '#0f172a',
          secondary: '#374151',
          muted: '#64748b',
          faint: '#94a3b8',
        },
        accent: {
          red: '#c8392b',
          green: '#16a34a',
          amber: '#d97706',
          blue: '#2563eb',
          teal: '#0e7490',
        },
        status: {
          published: '#16a34a',
          draft: '#64748b',
          review: '#d97706',
          archived: '#dc2626',
          scheduled: '#2563eb',
          pending: '#d97706',
          approved: '#16a34a',
          rejected: '#dc2626',
          flagged: '#ea580c',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
        sidebar: '4px 0 12px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideInLeft: { from: { transform: 'translateX(-20px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
