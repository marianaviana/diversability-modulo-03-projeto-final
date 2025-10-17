import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        home: 'home.html',
        admin: 'admin.html',
        sobre: 'sobre.html'
      }
    }
  },
  server: {
    port: 3000
  }
});