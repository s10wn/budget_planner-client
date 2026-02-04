import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/transactions': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/budgets': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/reports': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/currencies': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
