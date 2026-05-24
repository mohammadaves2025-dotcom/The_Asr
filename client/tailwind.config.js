/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0d1e29',
          'navy-dark': '#060f15',
          'navy-light': '#1a3a4f',
          yellow: '#FBFC09',
          red: '#c8392b',
          'red-dark': '#a82d23',
        },
        paper: '#fafaf8',
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f5f4f0',
          tertiary: '#eeede8',
          dark: '#0d1a22',
        },
        ink: {
          DEFAULT: '#111110',
          secondary: '#3a3a38',
          muted: '#767670',
          faint: '#a8a8a4',
        },
        accent: {
          red: '#c8392b',
          green: '#1a7a4a',
          amber: '#c97a10',
          blue: '#1d52b5',
          teal: '#0e7490',
          rose: '#e11d48',
          emerald: '#059669',
          purple: '#6d28d9',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10)',
        'nav': '0 2px 12px rgba(0,0,0,0.15)',
        'overlay': '0 8px 40px rgba(0,0,0,0.25)',
      },
      typography: {},
    },
  },
  plugins: [],
};
