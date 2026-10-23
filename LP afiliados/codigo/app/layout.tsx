import type { Metadata } from "next";
import { Anton, Newsreader } from "next/font/google";
import { content } from "@/content";
import { GoogleAdsTag } from "@/components/GoogleAdsTag";
import { CheckoutClickTracker } from "@/components/CheckoutClickTracker";
import "./globals.css";

/**
 * Duas fontes, escolhidas por contraste entre si — é o par que dá o
 * caráter "dossiê de performance" em vez de LP genérica.
 *
 * Anton: condensada pesadíssima, energia de cartaz de academia e de
 * número estampado em anilha. Só peso 400 existe, e é o suficiente —
 * ela nunca aparece em texto corrido, só em headline, número grande e
 * CTA. Preload ligado: entra no LCP (a headline do hero).
 *
 * Newsreader: serifada editorial, com eixo óptico variável. Serifa em
 * LP de suplemento é incomum de propósito — o público-alvo aqui tem
 * 40+, e serifa carrega autoridade de matéria jornalística, que é
 * exatamente a posição que a página assume (análise independente, não
 * loja). Também é mais confortável que sans no bloco longo de análise.
 *
 * preload:false na Newsreader porque a headline (Anton) é o LCP; a
 * serifada pode entrar um instante depois sem custo visível.
 */
const displayFont = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const bodyFont = Newsreader({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const { title, description, lang, ogLocale, siteUrl } = content.seo;

// Open Graph sempre — link compartilhado no WhatsApp sem título/imagem
// formatados perde clique. Canonical e imagem absoluta só entram com
// siteUrl definido: sem domínio, o Next resolveria contra localhost e
// publicaria URL errada no export estático.
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: ogLocale,
    // url e images precisam ser absolutos para o preview funcionar
    // (WhatsApp, Telegram, X). Resolvem contra metadataBase, que só
    // existe quando siteUrl existe — por isso vão juntos.
    ...(siteUrl && { url: "/", images: [content.hero.image.src] }),
  },
  ...(siteUrl && {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={lang}
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      {/* bg-dark, não branco: as seções pintam o próprio fundo, e um
          body branco piscava claro antes da primeira seção escura
          desenhar. Também é o fundo correto do overscroll no iOS. */}
      <body className="flex min-h-full flex-col bg-dark">
        {children}
        {/* Os dois somem do HTML sem conta de anúncios configurada —
            ver lib/ads.ts. */}
        <GoogleAdsTag />
        <CheckoutClickTracker />
      </body>
    </html>
  );
}
