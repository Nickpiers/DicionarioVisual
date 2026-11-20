import type { NextConfig } from "next";
import { API_URL } from "./lib/api/endereco";

/**
 * O build gera um site estático (pasta `out/`), publicado no S3 atrás do
 * CloudFront da API. Lá o próprio CloudFront entrega `/api/*` para a API e
 * escolhe a página certa de cada endereço (CloudFront Function no template do
 * backend), então nada aqui roda em servidor.
 *
 * No `next dev` não há CloudFront: os rewrites abaixo fazem o mesmo papel.
 */
const exportando = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(exportando ? { output: "export" as const } : {}),
  // Cada página vira `<rota>/index.html`, o formato que o S3 entrega.
  trailingSlash: true,
  // Sem servidor não há otimização de imagens; as imagens são servidas como estão.
  images: { unoptimized: true },
  experimental: {
    agentFeedback: true,
  },
  ...(exportando
    ? {}
    : {
        async rewrites() {
          return [
            /*
             * O navegador nunca fala com a API diretamente: tudo passa por
             * `/api/*`, no mesmo domínio do site, como o contrato exige (sem
             * CORS, e o cookie do refresh token fica no domínio do site).
             */
            {
              source: "/api/:caminho*",
              destination: `${API_URL}/api/:caminho*`,
            },
            // Toda palavra usa a página única `/palavras/_/` (como no CloudFront).
            {
              source: "/palavras/:slug/",
              destination: "/palavras/_/",
            },
          ];
        },
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
