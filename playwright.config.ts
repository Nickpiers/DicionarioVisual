import { defineConfig, devices } from "@playwright/test";

/**
 * Testes E2E contra o build de produção: o site estático de `out/`, o mesmo
 * que vai para o S3. Um servidor local imita o CloudFront
 * (tests/e2e/servidor-estatico.mjs) e a API é simulada em tests/e2e/api-falsa.ts.
 *
 * Testar o build (e não o `next dev`) garante que o que passa aqui é o que
 * vai ao ar, inclusive a regra de `/palavras/<slug>/`.
 */
const PORTA = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // Número fixo de workers: o padrão do Playwright (metade dos núcleos, 6
  // na máquina de desenvolvimento) fazia as páginas travarem no carregamento.
  // Com 3, nenhuma falha em 90 execuções repetidas.
  workers: process.env.CI ? 2 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORTA}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // `npm run build` gera `out/`; rode `npm run test:e2e` para fazer os dois.
    command: `node tests/e2e/servidor-estatico.mjs ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
  },
});
