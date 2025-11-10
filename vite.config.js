import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Thử HTTPS trước (như trong file HTML), nếu không được thì đổi về HTTP
        target: 'https://api.waterbase.click',
        changeOrigin: true,
        secure: true,
        ws: true,
        // Không rewrite path để giữ nguyên /api
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Đảm bảo không redirect
            proxyReq.setHeader('Host', 'api.waterbase.click');
          });
        },
      },
    },
    cors: true,
  },
})
