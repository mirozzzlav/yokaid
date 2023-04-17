import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default (mode) => {
  const envs = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const { VITE_PROXY_API_SUFFIX: proxyApiSuffix, VITE_API_URL: apiUrl } = envs;

  return defineConfig({
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        [proxyApiSuffix]: {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${proxyApiSuffix}`), ''),
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        src: resolve('src/'),
      },
    },
  });
};
