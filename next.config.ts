import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import { API_URL } from "./lib/api/endereco";
import pacote from "./package.json";

/** Saída de um comando git, ou vazio se o git não estiver disponível. */
function git(comando: string) {
  try {
    return execSync(`git ${comando}`, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

/**
 * Versão mostrada no cabeçalho, para saber qual build está no ar nos testes:
 * versão do package.json, commit e data/hora do build. Um `*` depois do commit
 * indica que o build saiu de uma pasta com alterações não commitadas.
 */
const commit = git("rev-parse --short HEAD");
const alterado = commit && git("status --porcelain") ? "*" : "";
const dataBuild = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
}).format(new Date());

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
  env: {
    NEXT_PUBLIC_VERSAO: pacote.version,
    NEXT_PUBLIC_COMMIT: commit ? commit + alterado : "local",
    NEXT_PUBLIC_DATA_BUILD: dataBuild,
  },
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
