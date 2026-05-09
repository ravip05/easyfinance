/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['28px', { fontWeight: '600' }],
        'h2': ['22px', { fontWeight: '500' }],
        'h3': ['18px', { fontWeight: '500' }],
        'body': ['15px', { fontWeight: '400' }],
        'table': ['13px', { fontWeight: '400' }],
        'label': ['12px', { fontWeight: '500' }],
      },
      spacing: {
        'micro': '4px',
        'base': '8px',
        'section': '16px',
        'card': '24px',
        'layout': '32px',
      },
      colors: {
        primary: '#2563EB',
        dark: '#0F172A',
        background: '#F8FAFC',
        success: '#16A34A',
        error: '#DC2626',
      }
    },
  },
  plugins: [],
}
