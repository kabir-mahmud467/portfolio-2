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
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // Inline assets < 4KB
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        projects: resolve(__dirname, 'projects/index.html'),
        social: resolve(__dirname, 'social/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('gsap')) return 'vendor-gsap';
            return 'vendor'; // all other dependencies
          }
        }
      }
    }
  }
});
