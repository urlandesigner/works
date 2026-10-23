import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Publicação no works (GitHub Pages, subpasta): só muda quando a env var
// existe, pra não afetar o dev/build normal do projeto. Prefixo VITE_ pra
// o mesmo valor também chegar ao router no código do cliente.
const exportBasePath = process.env.VITE_BASE_PATH

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  ...(exportBasePath ? { base: exportBasePath + '/' } : {}),
  server: {
    port: 5174,
    /** Escuta em todas as interfaces (útil em VM/WSL/rede local). */
    host: true,
    /** Se 5174 estiver ocupada, o Vite tenta a próxima e mostra a URL certa no terminal. */
    strictPort: false,
    /** Abre o navegador ao rodar `npm run dev`. */
    open: true,
  },
})
