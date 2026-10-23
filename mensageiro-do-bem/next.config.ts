import type { NextConfig } from "next";

// Publicação no works (GitHub Pages, subpasta): só ativa quando a env var
// existe, pra não afetar o deploy normal (Vercel, com backend de verdade).
const exportBasePath = process.env.EXPORT_BASE_PATH;

const nextConfig: NextConfig = {
  ...(exportBasePath
    ? {
        output: "export" as const,
        basePath: exportBasePath,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
