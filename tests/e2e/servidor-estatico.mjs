/**
 * Servidor do site estático (`out/`) para os testes E2E. Faz o mesmo papel do
 * S3 + CloudFront em produção:
 *  - `/rota/` entrega `/rota/index.html`;
 *  - qualquer `/palavras/<slug>/...` entrega `/palavras/_/...` (a página única
 *    de palavra, como a CloudFront Function do backend);
 *  - o que não existe responde 404 com `404.html`.
 * As chamadas a `/api/*` nunca chegam aqui: o Playwright as intercepta.
 *
 * Uso: node tests/e2e/servidor-estatico.mjs [porta]
 */
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const RAIZ = resolve("out");
const PORTA = Number(process.argv[2] ?? 3100);

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function arquivo(caminho) {
  const alvo = normalize(join(RAIZ, caminho));
  if (!alvo.startsWith(RAIZ)) return null;
  try {
    const info = statSync(alvo);
    if (info.isFile()) return alvo;
    if (info.isDirectory()) return arquivo(join(caminho, "index.html"));
  } catch {}
  return null;
}

createServer((req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  // Página única de palavra (como a CloudFront Function).
  caminho = caminho.replace(/^\/palavras\/[^/]+(?=\/|$)/, "/palavras/_");

  const encontrado = arquivo(caminho);
  const status = encontrado ? 200 : 404;
  const entregue = encontrado ?? join(RAIZ, "404.html");
  res.writeHead(status, {
    "Content-Type": TIPOS[extname(entregue)] ?? "application/octet-stream",
  });
  createReadStream(entregue).pipe(res);
}).listen(PORTA, () => {
  console.log(`Site estático em http://localhost:${PORTA}`);
});
