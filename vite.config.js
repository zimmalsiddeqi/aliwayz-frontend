import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@api':        path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features':   path.resolve(__dirname, './src/features'),
      '@hooks':      path.resolve(__dirname, './src/hooks'),
      '@lib':        path.resolve(__dirname, './src/lib'),
      '@router':     path.resolve(__dirname, './src/router'),
      '@store':      path.resolve(__dirname, './src/store'),
      '@styles':     path.resolve(__dirname, './src/styles'),
      '@utils':      path.resolve(__dirname, './src/utils'),
      '@types':      path.resolve(__dirname, './src/types'),
    },
  },

  server: {
    port: 5173,
    // ─────────────────────────────────────────
    // PROXY: All /api/* calls → backend:3000
    // This eliminates CORS in development
    // ─────────────────────────────────────────
    proxy: {
      '/api': {
        target:       'http://localhost:3000',
        changeOrigin: true,
        secure:       false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Proxy Error]', err.message);
          });
          proxy.on('proxyReq', (_, req) => {
            console.info('[Proxy →]', req.method, req.url);
          });
        },
      },
      '/socket.io': {
        target:       'http://localhost:3000',
        ws:           true,
        changeOrigin: true,
        secure:       false,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query:  ['@tanstack/react-query'],
          motion: ['framer-motion'],
          socket: ['socket.io-client'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});