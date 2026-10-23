import type { NextConfig } from "next";

// Publicação no works (GitHub Pages, subpasta): só ativa quando a env var
// existe, pra não afetar o build normal da hospedagem própria.
const exportBasePath = process.env.EXPORT_BASE_PATH;

const nextConfig: NextConfig = {
  // Hospedagem própria: gera HTML/CSS/JS estático em out/.
  output: "export",

  ...(exportBasePath ? { basePath: exportBasePath } : {}),

  images: {
    // Obrigatório com output: 'export' — o otimizador de imagem do Next
    // exige servidor e não roda em export estático.
    //
    // CONSEQUÊNCIA: nenhuma imagem é comprimida no build. Cada imagem
    // precisa ser otimizada À MÃO antes de entrar em public/.
    // Alvo: hero < 200 KB, página < 2 MB.
    unoptimized: true,
  },

  // Emite /pagina/index.html em vez de /pagina.html — o que a maioria
  // das hospedagens compartilhadas espera servir.
  trailingSlash: true,
};

export default nextConfig;
