module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h3: {
              marginTop: theme('spacing.4'), // This applies a top margin of 1rem
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
    require('flowbite-typography')
  ],
  content: [
    "./node_modules/flowbite/**/*.js"
  ]
}