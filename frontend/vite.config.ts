import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Bind to all interfaces to allow external access (required for production mode)
    // This enables access via http://ip:3000 from other devices on the network
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
});
