import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { content } from "@/content";
import "./globals.css";

// Só a fonte de texto: a LP não usa monospace, e cada fonte extra
// pesa no LCP. next/font faz self-host no build (funciona em export).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
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
    <html lang={lang} className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
