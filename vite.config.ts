import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.VITE_PORT),
      host: true,
      allowedHosts: true,
      ...(env.VITE_DEV_PROXY_TARGET
        ? {
            proxy: {
              '/api': {
                target: env.VITE_DEV_PROXY_TARGET,
                changeOrigin: true,
                rewrite: (requestPath: string) => requestPath.replace(/^\/api/, ''),
              },
              '/media': {
                target: env.VITE_DEV_PROXY_TARGET,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules\/(react|react-dom|react-router|react-router-dom)\//.test(id)) return 'vendor-react';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('@base-ui/react')) return 'vendor-ui';
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
