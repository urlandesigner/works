import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: o build funciona em qualquer subpasta, sem precisar
  // saber de antemão onde vai ser servido (aqui, dentro do works).
  base: './',
  // Porta fixa do projeto — sempre rodar em 3004 (ver CLAUDE.md).
  server: { port: 3004, strictPort: true },
  preview: { port: 3004, strictPort: true },
})
