import type { MetadataRoute } from "next";
import { content, conteudoEstaPronto } from "@/content";

/**
 * robots.txt gerado no build.
 *
 * A indexação é AMARRADA à prontidão do conteúdo, de propósito: enquanto
 * houver placeholder ([PENDING], link de afiliado falso), a página é
 * bloqueada por inteiro. Uma LP de afiliado indexada com texto de
 * rascunho à mostra é exatamente o alvo do sistema de helpful content do
 * Google — e recuperar reputação de domínio é bem mais lento do que
 * ganhar indexação depois.
 *
 * Resolvidos os pendentes, o bloqueio some sozinho no próximo build.
 *
 * As páginas legais (/privacy, /terms, /contact) NÃO entram em disallow.
 * São linkadas do rodapé, e o revisor de política do Google Ads precisa
 * conseguir chegar nelas — bloquear seria trabalhar contra o próprio
 * motivo de existirem. Ficam de fora do sitemap, isso sim: sitemap é a
 * lista do que se quer ranqueando, e não é o caso delas.
 */
// Exigido com output: 'export' — sem isto o build falha com
// "not configured on route /robots.txt". Rotas de metadata são tratadas
// como dinâmicas por padrão; aqui elas são geradas uma vez, no build.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = content.seo;

  if (!conteudoEstaPronto()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    // Referência ao sitemap exige URL absoluta — só entra com domínio
    // resolvido (ver resolveSiteUrl em content.ts).
    ...(siteUrl && { sitemap: `${siteUrl}/sitemap.xml` }),
  };
}
