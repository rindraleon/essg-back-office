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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            const normalizedId = id.replace(/\\/g, '/');
            if (/node_modules\/(react|react-dom|react-router|react-router-dom)\//.test(normalizedId))
              return 'vendor-react';
            if (normalizedId.includes('@tanstack/react-query')) return 'vendor-query';
            if (normalizedId.includes('@base-ui/react')) return 'vendor-ui';
            if (normalizedId.includes('/exceljs/')) return 'vendor-exceljs';
            if (normalizedId.includes('/pdfjs-dist/')) return 'vendor-pdf';
            if (normalizedId.includes('/tesseract.js/')) return 'vendor-ocr';
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
