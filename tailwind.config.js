module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        secondary: '#0b141a',
        accent: '#075e54'
      },
      boxShadow: {
        'soft': '0 6px 18px rgba(2,6,23,0.6)'
      },
      borderRadius: {
        'lg-soft': '14px'
      }
    }
  },
  plugins: []
}
