/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
        serif: ['var(--font-pretendard)', 'Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'body-sm': ['13px', { lineHeight: '1.6' }],
        'body': ['15px', { lineHeight: '1.7' }],
        'body-lg': ['17px', { lineHeight: '1.7' }],
        'section': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'title': ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'hero': ['30px', { lineHeight: '1.3', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}