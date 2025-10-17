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
    },
    // Otimizações para produção
    minify: 'esbuild',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true
  },
  // Configurações importantes para deploy
  base: './',
  publicDir: 'public',
  optimizeDeps: {
    include: []
  }
});