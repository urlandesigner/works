import type { MetadataRoute } from "next";
import { content, conteudoEstaPronto } from "@/content";

/**
 * sitemap.xml gerado no build.
 *
 * Vazio quando falta domínio (URL de sitemap precisa ser absoluta) ou
 * quando o conteúdo ainda tem pendência — nesse caso o robots.txt já
 * bloqueia tudo, e anunciar no sitemap uma página bloqueada seria
 * contraditório.
 *
 * /experimento fica de fora: é noindex, e sitemap é justamente a lista
 * do que você QUER indexado.
 *
 * Sem `lastModified`: ele mudaria a cada deploy mesmo sem o conteúdo
 * mudar, o que é sinal falso de atualização. Melhor ausente do que
 * mentindo — quando houver conteúdo com data real de revisão, aí sim.
 */
// Exigido com output: 'export' — ver nota idêntica em robots.ts.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = content.seo;

  if (!siteUrl || !conteudoEstaPronto()) return [];

  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
