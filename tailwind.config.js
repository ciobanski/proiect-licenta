/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  darkMode: 'class', // class, 'media' or boolean
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#212121',
          800: '#2f3136',
          850: '#252526',
          700: '#36393f',
          600: '#4f545c',
          450: '#d3d3d3',
          400: '#d4d7dc',
          300: '#e3e5e8',
          200: '#ebedef',
          100: '#f2f3f5',
        },
      },
      width: {
        loginform: '56rem', // 896px
        75: '75%',
        editor: '72rem', // 1152px
      },

      height: {
        75: '75%',
      }
    },
    plugins: [],
  },
};