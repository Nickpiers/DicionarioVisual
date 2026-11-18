/**
 * Endereço da API (sem `/api` no final), lido de `API_URL`. Usado pelo proxy
 * do next.config e pelas consultas feitas no servidor.
 */
export const API_URL = (
  process.env.API_URL ?? "https://doudh9dqt2uk3.cloudfront.net"
).replace(/\/+$/, "");
