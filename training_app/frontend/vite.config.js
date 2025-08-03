import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the training app frontend. Tailwind CSS is enabled via
// postcss.config.js and tailwind.config.js. The server is configured to proxy
// API requests during development to the backend running on port 3001.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});