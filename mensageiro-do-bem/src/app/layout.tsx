import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Script from "next/script";
import { OFFICIAL_SITE_URL } from "@/constants/messages";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
});

const SITE_TITLE = "Mensageiro do Bem · Uma mensagem no momento certo";
const SITE_DESCRIPTION =
  "Receba uma mensagem carinhosa e inspiradora por um gesto simbólico. Rápido, sem cadastro e feito para emocionar — e a maior parte é doada para ajudar quem precisa.";

export const metadata: Metadata = {
  metadataBase: new URL(OFFICIAL_SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Mensageiro do Bem",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Mensageiro do Bem",
  keywords: [
    "mensagem inspiradora",
    "mensagem de carinho",
    "mensagem do bem",
    "motivação",
    "acolhimento",
    "doação",
    "PIX do bem",
  ],
  authors: [{ name: "Urlan Dipré", url: "https://udlabs.com.br" }],
  creator: "Urlan Dipré",
  publisher: "UD Labs",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Mensageiro do Bem",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const SITE_URL = OFFICIAL_SITE_URL.replace(/\/$/, "");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Mensageiro do Bem",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      founder: {
        "@type": "Person",
        name: "Urlan Dipré",
        url: "https://udlabs.com.br",
      },
      brand: { "@type": "Brand", name: "UD Labs", url: "https://udlabs.com.br" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Mensageiro do Bem",
      inLanguage: "pt-BR",
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${cormorant.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-[15px] font-normal leading-relaxed text-[var(--ink)] sm:text-base">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FSNVX01PY6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FSNVX01PY6');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
