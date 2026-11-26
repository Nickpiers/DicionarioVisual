import { expect, test, type Page } from "@playwright/test";
import { USUARIO, usarApiFalsa } from "./api-falsa";

/**
 * Zoom, reflow e movimento reduzido (itens do roteiro manual que dá para
 * automatizar):
 * - WCAG 1.4.4 Redimensionar texto: com zoom de 200%, nada fica cortado;
 * - WCAG 1.4.10 Reflow: em 320 px de largura, sem rolagem horizontal;
 * - WCAG 2.3.3 Animação por interação: com "reduzir movimento", a animação para.
 *
 * Zoom de 200% numa tela de 1920 px equivale a uma janela de 960 px; numa de
 * 1366 px, a 683 px. Por isso a largura cobre de 320 a 1280 px.
 */
const LARGURAS = [1280, 1200, 1100, 1024, 960, 901, 900, 768, 683, 600, 480, 360, 320];

const TELAS = ["/", "/busca?q=banco", "/palavras/banco/", "/palavras", "/entrar", "/contribuir"];

/** Pessoa com nome comprido: o nome aparece no botão da conta. */
const NOME_LONGO = { ...USUARIO, name: "Maria Aparecida Fernandes" };

/** Elementos visíveis que passam da borda direita ou esquerda da janela. */
const foraDaTela = (page: Page) =>
  page.evaluate(() => {
    const largura = document.documentElement.clientWidth;
    const cortados = [...document.querySelectorAll("header a, header button, main a, main button, main input")]
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 1 && (r.right > largura + 1 || r.left < -1);
      })
      .map((el) => (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40));
    return {
      rolagemHorizontal: document.documentElement.scrollWidth > largura,
      cortados,
    };
  });

for (const logado of [false, true]) {
  test(`nada cortado e sem rolagem horizontal de 320 a 1280 px${logado ? " (logado)" : ""}`, async ({ page }) => {
    await usarApiFalsa(page, { logado, usuario: NOME_LONGO });
    const problemas: string[] = [];
    for (const caminho of TELAS) {
      if (caminho === "/contribuir" && !logado) continue;
      for (const largura of LARGURAS) {
        await page.setViewportSize({ width: largura, height: 800 });
        await page.goto(caminho);
        await expect(page.locator("h1").first()).toBeVisible();
        const r = await foraDaTela(page);
        if (r.rolagemHorizontal || r.cortados.length) {
          problemas.push(`${caminho} em ${largura}px: ${r.rolagemHorizontal ? "rolagem horizontal; " : ""}${r.cortados.join(", ")}`);
        }
      }
    }
    expect(problemas).toEqual([]);
  });
}

test("com 'reduzir movimento', a animação da página inicial para", async ({ page }) => {
  await usarApiFalsa(page);
  const anel = page.locator("figure span.motion-safe\\:animate-\\[pulso-video_2\\.6s_ease-out_infinite\\]");

  await page.goto("/");
  await expect(anel).toHaveCSS("animation-name", "pulso-video");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(anel).toHaveCSS("animation-name", "none");
});
