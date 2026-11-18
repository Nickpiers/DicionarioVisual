import type { NextConfig } from "next";
import { API_URL } from "./lib/api/endereco";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  /**
   * O navegador nunca fala com a API diretamente: tudo passa por `/api/*`, no
   * mesmo domínio do site, como o contrato exige (sem CORS, e o cookie do
   * refresh token fica no domínio do site).
   */
  async rewrites() {
    return [
      {
        source: "/api/:caminho*",
        destination: `${API_URL}/api/:caminho*`,
      },
    ];
  },
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
