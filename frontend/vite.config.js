import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,          // equivalent to 0.0.0.0
    port: 5173,
    allowedHosts: ['urban.lukasdsouza.com'], // or ['.yourdomain.com']
    proxy: {
      '/api': 'http://localhost:5000',
      '/ml': 'http://localhost:5001',
    },
  },
})
