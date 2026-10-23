/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        /** Títulos e destaques — contraste com o corpo (Manrope). */
        display: ['"Plus Jakarta Sans"', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        /** Elevação suave tipo produto SaaS (camadas discretas). */
        card:
          '0 1px 0 rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px -6px rgba(15, 23, 42, 0.08)',
        'card-sm':
          '0 1px 0 rgba(15, 23, 42, 0.03), 0 1px 2px rgba(15, 23, 42, 0.04)',
        header:
          '0 1px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -4px rgba(15, 23, 42, 0.07)',
      },
      colors: {
        brand: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          500: '#18181b',
          600: '#09090b',
          700: '#000000',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
