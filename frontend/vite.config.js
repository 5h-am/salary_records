import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Only active in local dev (vite dev server)
      // In production, VITE_API_BASE_URL points directly to Render
      '/api-dev': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api-dev/, ''),
      },
    },
  },
});
