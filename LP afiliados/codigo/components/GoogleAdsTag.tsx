import Script from "next/script";
import { GOOGLE_ADS_ID } from "@/lib/ads";

/**
 * A tag global do Google Ads (gtag.js).
 *
 * Some por inteiro quando `NEXT_PUBLIC_GOOGLE_ADS_ID` não está definida
 * — e some no HTML, não só na execução: sem conta de anúncios, a página
 * não carrega script de terceiro nenhum. É o que mantém o peso e o LCP
 * intactos enquanto a campanha não existe.
 *
 * `afterInteractive` (padrão do next/script) é o correto aqui:
 * `beforeInteractive` atrasaria o conteúdo por um script de medição, e
 * `lazyOnload` poderia perder o clique de um visitante rápido.
 *
 * O gtag também é o que grava o `gclid` do auto-tagging num cookie
 * primário (`_gcl_aw`) na chegada. Sem isso, mesmo com a conversão
 * disparando, o Ads não consegue ligar o clique de saída ao anúncio que
 * trouxe a pessoa — e o dado vira ruído em vez de aprendizado.
 */
export function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        id="gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <Script id="gtag-init">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
