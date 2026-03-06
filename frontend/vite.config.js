import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler'], // Keep the compiler if you're using it
          // REMOVED: ['@locator/babel-jsx/dist'] <--- This was causing the escape sequence error
        ],
      },
    }),
  ],
})