import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const require = createRequire(import.meta.url);

function resolveSharedDependencies() {
  return {
    name: 'resolve-shared-deps',
    resolveId(source, importer) {
      if (importer && (importer.includes('shared') || importer.includes('shared\\src'))) {
        if (!source.startsWith('.') && !source.startsWith('/') && !source.startsWith('@')) {
          try {
            return require.resolve(source, { paths: [path.resolve(__dirname, 'node_modules')] });
          } catch (e) {
            // Ignore fallback
          }
        } else if (source.startsWith('@') && !source.startsWith('@/') && !source.startsWith('@features') && !source.startsWith('@router') && !source.startsWith('@shared') && !source.startsWith('@api') && !source.startsWith('@components') && !source.startsWith('@hooks') && !source.startsWith('@lib') && !source.startsWith('@store') && !source.startsWith('@styles') && !source.startsWith('@utils') && !source.startsWith('@types')) {
          try {
            return require.resolve(source, { paths: [path.resolve(__dirname, 'node_modules')] });
          } catch (e) {
            // Ignore fallback
          }
        }
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    resolveSharedDependencies(),
  ],

  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@features':   path.resolve(__dirname, './src/features'),
      '@router':     path.resolve(__dirname, './src/router'),
      '@shared':     path.resolve(__dirname, '../shared/src'),
      '@api':        path.resolve(__dirname, '../shared/src/api'),
      '@components': path.resolve(__dirname, '../shared/src/components'),
      '@hooks':      path.resolve(__dirname, '../shared/src/hooks'),
      '@lib':        path.resolve(__dirname, '../shared/src/lib'),
      '@store':      path.resolve(__dirname, '../shared/src/store'),
      '@styles':     path.resolve(__dirname, '../shared/src/styles'),
      '@utils':      path.resolve(__dirname, '../shared/src/utils'),
      '@types':      path.resolve(__dirname, '../shared/src/types'),
    },
  },

  server: {
    port: 5173,
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