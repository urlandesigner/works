import type { MetadataRoute } from "next";
import { OFFICIAL_SITE_URL } from "@/constants/messages";

const BASE = OFFICIAL_SITE_URL.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rotas internas, privadas ou transacionais — fora do índice de busca.
      disallow: [
        "/api/",
        "/mensagem",
        "/pagamento",
        "/historico",
        "/email-templates",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
