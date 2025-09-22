/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        //EduMate color for filling in fields
        edumatePurpleLight: '#6B3F8C',
      },
    },
  },
  plugins: [],

}
