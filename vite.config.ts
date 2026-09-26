import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// `npm run dev` serves the site locally and forwards /api to the live backend, so it shows real
// CMS content. Point API_PROXY at a preview deployment (or http://localhost:3000 under
// `vercel dev`) to work against something else.
const apiTarget = process.env.API_PROXY || 'https://ptm-fe.vercel.app'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true, secure: true },
    },
  },
})
