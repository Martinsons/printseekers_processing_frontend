import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://web-production-33796.up.railway.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
