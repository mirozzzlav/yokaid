import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { transformSync } from '@babel/core';
import transformReactJsx from '@babel/plugin-transform-react-jsx';

const jsAsJsx = () => ({
  name: 'js-as-jsx',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('/src/') || !id.endsWith('.js') || !code.includes('<')) {
      return null;
    }

    const result = transformSync(code, {
      filename: id,
      babelrc: false,
      configFile: false,
      plugins: [[transformReactJsx, { runtime: 'automatic' }]],
      sourceMaps: true,
    });

    return result ? { code: result.code, map: result.map } : null;
  },
});

// https://vitejs.dev/config/
export default () =>
  defineConfig({
    plugins: [jsAsJsx(), react(), svgr()],
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
          target: `http://0.0.0.0:${process.env.VITE_MEDIA_STORE_PORT}`,
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
    build: {
      rolldownOptions: {
        moduleTypes: {
          '.js': 'jsx',
        },
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
      rolldownOptions: {
        moduleTypes: {
          '.js': 'jsx',
        },
      },
    },
  });
