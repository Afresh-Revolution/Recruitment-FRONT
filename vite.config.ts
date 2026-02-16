import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use root so asset paths work on Render (e.g. /assets/xxx.jpg). Change only if deploying at a subpath.
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  publicDir: 'public',
})









