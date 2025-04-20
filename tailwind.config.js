import { defineConfig } from 'tailwindcss'

export default defineConfig({
  files: {
    include: [
      './templates/**/*.html',
      './app/**/*.py'
    ],
    exclude: []
  },
  theme: {
    extend: {},
  },
  plugins: [],
})
