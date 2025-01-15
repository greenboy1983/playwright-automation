import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080,
    proxy: {
      // 代理所有 /uopen-automation 开头的请求
      '/uopen-automation': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // 代理所有 /api 开头的请求
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // 代理所有 /reports 开头的请求
      '/show-reports': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // 代理 WebSocket 连接
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true
      },
      '/test': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}) 