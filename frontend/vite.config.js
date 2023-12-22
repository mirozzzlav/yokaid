import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default () =>
  defineConfig({
    plugins: [react(), svgr()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: `http://0.0.0.0:${process.env.VITE_API_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
        },
        '/media': {
          target: 'http://0.0.0.0:9090',
          changeOrigin: true,
          rewrite: (path) => path,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        src: resolve('src/'),
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes('react-router-dom') ||
              id.includes('@remix-run') ||
              id.includes('react-router')
            ) {
              return 'react-router';
            }
            if (id.includes('chakra-ui') || id.includes('framer-motion')) {
              return 'chakra-ui';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            return 'index';
          },
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  });
