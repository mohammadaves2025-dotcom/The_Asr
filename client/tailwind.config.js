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
          secondary: '#f8f6f2',
          tertiary: '#f0ede8',
          dark: '#0d1a22',
        },
        ink: {
          DEFAULT: '#0d1a22',
          secondary: '#374151',
          muted: '#6b7280',
          faint: '#9ca3af',
        },
        accent: {
          red: '#c8392b',
          green: '#1a5c38',
          blue: '#1d3557',
          amber: '#b45309',
          teal: '#0e7490',
          rose: '#be123c',
          emerald: '#065f46',
        },
        status: {
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          info: '#2563eb',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        nav: '0 2px 8px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        ticker: 'ticker 40s linear infinite',
        shimmer: 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        ticker: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(-100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#0d1a22',
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            'h1,h2,h3,h4': {
              fontFamily: '"Playfair Display", Georgia, serif',
              color: '#0d1a22',
              lineHeight: '1.2',
            },
            a: { color: '#122837' },
            blockquote: {
              borderLeftColor: '#122837',
              borderLeftWidth: '4px',
              fontStyle: 'italic',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
