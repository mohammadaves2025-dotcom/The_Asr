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
          rose: '#e11d48',
          emerald: '#059669',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
