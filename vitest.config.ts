import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    // jsdom pour les composants ; les utilitaires purs tournent aussi bien.
    environment: 'jsdom',
    globals: true,
  },
});
