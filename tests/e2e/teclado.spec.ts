import { expect, test, type Page } from "@playwright/test";
import { usarApiFalsa } from "./api-falsa";

/**
 * Uso só com o teclado (o axe não verifica isso):
 * - WCAG 2.1.1 Teclado: tudo o que se faz com o mouse também se faz com o teclado;
 * - WCAG 2.1.2 Sem bloqueio do teclado: o foco consegue sair de qualquer componente;
 * - WCAG 2.4.7 Foco visível: o elemento com foco tem indicação visível.
 */

/** Aperta Tab até o elemento ganhar foco (no máximo `limite` vezes). */
async function tabAte(page: Page, alvo: ReturnType<Page["locator"]>, limite = 40) {
  for (let i = 0; i < limite; i++) {
    await page.keyboard.press("Tab");
    if (await alvo.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error(`O elemento não recebeu foco depois de ${limite} Tabs.`);
}

/**
 * Como o elemento com foco agora indica o foco. O site usa duas formas: o
 * contorno amarelo de 4px (links, botões, campos) ou, no campo de busca, a
 * borda amarela do formulário em volta (`focus-within`).
 */
const indicacaoDeFoco = (page: Page) =>
  page.evaluate(() => {
    const AMARELO = "rgb(246, 199, 68)"; // --focus
    const el = document.activeElement!;
    const estilo = getComputedStyle(el);
    if (estilo.outlineStyle !== "none" && estilo.outlineWidth !== "0px") {
      return `contorno ${estilo.outlineWidth} ${estilo.outlineColor}`;
    }
    for (let pai = el.parentElement, i = 0; pai && i < 3; pai = pai.parentElement, i++) {
      if (getComputedStyle(pai).borderTopColor === AMARELO) return `borda do ${pai.tagName.toLowerCase()} ${AMARELO}`;
    }
    return "nenhuma";
  });

test.beforeEach(async ({ page }) => {
  await usarApiFalsa(page);
});

test("busca uma palavra usando só o teclado", async ({ page }) => {
  await page.goto("/");
  const campo = page.locator("#search-main");

  await tabAte(page, campo);
  expect(await indicacaoDeFoco(page)).toBe("borda do form rgb(246, 199, 68)");

  await page.keyboard.type("banco");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/busca\/?\?q=banco/);

  const link = page.getByRole("link", { name: /Ver significados/ });
  await expect(link).toBeVisible();
  await tabAte(page, link);
  expect(await indicacaoDeFoco(page)).toBe("contorno 4px rgb(246, 199, 68)");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: /BANCO/ })).toBeVisible();
});

test("janela do vídeo abre e fecha pelo teclado sem prender o foco", async ({ page }) => {
  await page.goto("/");
  const ampliar = page.getByRole("button", { name: "Ampliar" });

  await tabAte(page, ampliar);
  await page.keyboard.press("Enter");
  const janela = page.getByRole("dialog", { name: /Apresentação do Dicionário Libras/ });
  await expect(janela).toBeVisible();
  // O foco vai para dentro da janela.
  await expect(janela.getByRole("button", { name: "Fechar vídeo" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(janela).toBeHidden();
  // E volta para o botão que abriu a janela.
  await expect(ampliar).toBeFocused();
});

test("link \"Pular vídeo\" leva o foco direto ao significado", async ({ page }) => {
  // Problema achado no teste com o NVDA: o player do YouTube tem dezenas de
  // paradas de Tab entre o vídeo e o texto do significado.
  await page.goto("/palavras/banco/");
  const pular = page.getByRole("link", { name: "Pular vídeo e ir para o significado" });

  // Invisível até receber foco (WCAG 2.4.1 e 2.4.7).
  expect(await pular.evaluate((el) => el.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
  await tabAte(page, pular);
  expect(await pular.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(1);
  expect(await indicacaoDeFoco(page)).toBe("contorno 4px rgb(246, 199, 68)");

  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 3, name: "O que significa?" })).toBeFocused();
  // O próximo Tab continua depois do vídeo, e não volta para dentro dele.
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("IFRAME");
});

test("seções da página da palavra são títulos navegáveis pelo leitor de tela", async ({ page }) => {
  // O NVDA pula entre títulos com a tecla H; antes, essas seções eram só texto.
  await page.goto("/palavras/banco/");
  const titulos = page.getByRole("heading", { level: 3 });
  await expect(titulos).toHaveText(["Sinal em Libras", "Imagem de apoio", "O que significa?"]);
  await expect(page.getByRole("heading", { level: 4, name: "Exemplo em português" })).toBeVisible();
  // A troca de sentido é anunciada com separação entre número e nome.
  await expect(page.locator("[aria-live=polite]").first()).toHaveText(/Sentido 1 de 2, Instituição financeira/i);
});

test("sentido sem vídeo mostra um aviso, e não um player falso", async ({ page }) => {
  // Antes: foto sem relação com o sentido e um botão "Reproduzir vídeo" que não
  // fazia nada.
  await page.goto("/palavras/banco/");
  await page.getByRole("button", { name: "Ver próximo sentido" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Assento" })).toBeVisible();

  await expect(page.getByText("Vídeo em Libras ainda não disponível")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reproduzir vídeo" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Pular vídeo/ })).toHaveCount(0);
  await expect(page.locator("main img[alt*='Intérprete']")).toHaveCount(0);
});
