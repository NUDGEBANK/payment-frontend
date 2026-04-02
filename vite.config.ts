import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
      },
    },
    allowedHosts: [
        'lionhearted-elroy-intergular.ngrok-free.dev',
    ],
  },
})
