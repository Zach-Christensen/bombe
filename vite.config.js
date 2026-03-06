import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        base: resolve(__dirname, 'index.html'),
        crt: resolve(__dirname, 'crt.html'),
        spy: resolve(__dirname, 'spy.html'),
        coldwar: resolve(__dirname, 'coldwar.html'),
        cyberpunk: resolve(__dirname, 'cyberpunk.html'),
        dusk: resolve(__dirname, 'dusk.html'),
        reef: resolve(__dirname, 'reef.html'),
        ember: resolve(__dirname, 'ember.html'),
        slate: resolve(__dirname, 'slate.html'),
        comparison: resolve(__dirname, 'compare.html'),
      },
    },
  },
});
