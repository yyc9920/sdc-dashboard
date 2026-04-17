/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Noto Serif KR', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        kid: ['Gaegu', 'Noto Sans KR', 'cursive'],
      },
      colors: {
        burgundy: {
          50:  '#fdf4f4',
          100: '#fce7e8',
          500: '#8b1e2e',
          600: '#731724',
          700: '#5b1220',
          900: '#38080f',
        },
        gold: {
          100: '#fdf4dc',
          400: '#e0b866',
          500: '#c99b3b',
          600: '#a17724',
        },
      },
    },
  },
  plugins: [],
};
