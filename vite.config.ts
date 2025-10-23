import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const isGitHubPagesBuild = process.env.DEPLOY_TARGET === 'gh-pages'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHubPagesBuild ? '/transcript_tag/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
})
