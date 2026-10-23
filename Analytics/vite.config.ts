import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Publicação no works (GitHub Pages, subpasta): só muda quando a env var
// existe, pra não afetar o dev/build normal do projeto.
const exportBasePath = process.env.VITE_BASE_PATH;

export default defineConfig({
  plugins: [react()],
  ...(exportBasePath ? { base: exportBasePath + '/' } : {}),
  // Projeto roda sempre na porta 5174 (strictPort evita fallback para outra porta).
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
