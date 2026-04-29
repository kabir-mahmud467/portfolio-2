import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11', 'Android >= 5'],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        projects: resolve(__dirname, 'projects/index.html'),
        social: resolve(__dirname, 'social/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
      }
    }
  }
});
