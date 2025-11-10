import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy này CHỈ DÙNG CHO 'npm run dev' (local)
      // Nó sẽ chuyển tiếp request từ localhost:xxxx/api -> https://api.waterbase.click/api
      '/api': {
        target: 'https://api.waterbase.click',
        changeOrigin: true,
        secure: true,
      },
    },
    cors: true,
  },
})