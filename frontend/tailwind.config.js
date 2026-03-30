/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg':        '#1e1e2f',
        'dark-sidebar':   '#2a2a3a',
        'dark-header':    '#1a1a2a',
        'dark-bubble-u':  '#2e2e4f',
        'dark-bubble-a':  '#3a3a5a',
        'dark-input':     '#252535',
        'dark-border':    '#3a3a5a',
        'light-bubble-u': '#d4e8fd',
        'light-bubble-a': '#f1f0f0',
        brand: '#4f7df0',
      },
      borderRadius: {
        xl2: '16px',
      },
    },
  },
  plugins: [],
}

