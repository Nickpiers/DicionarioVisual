import { expect, test } from "@playwright/test";
import { usarApiFalsa } from "./api-falsa";

test.beforeEach(async ({ page }) => {
  await usarApiFalsa(page);
});

test("busca uma palavra pela página inicial e abre os significados", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Buscar palavra").first().fill("banco");
  await page.getByRole("button", { name: "Buscar" }).first().click();

  await expect(page).toHaveURL(/\/busca\/?\?q=banco/);
  await expect(page.getByRole("heading", { name: /1 resultado para/ })).toBeVisible();

  await page.getByRole("link", { name: /Ver significados/ }).click();

  await expect(page).toHaveURL(/\/palavras\/banco\/?/);
  await expect(page.getByRole("heading", { level: 1, name: /BANCO/ })).toBeVisible();
  await expect(page.getByText("Instituição financeira").first()).toBeVisible();
});

test("mostra o estado vazio quando nada é encontrado", async ({ page }) => {
  await page.goto("/busca?q=xyzabc");
  await expect(page.getByRole("heading", { name: "Nenhuma palavra encontrada" })).toBeVisible();
});

test("abre uma palavra direto pelo endereço", async ({ page }) => {
  await page.goto("/palavras/manga/");
  await expect(page.getByRole("heading", { level: 1, name: /MANGA/ })).toBeVisible();
  await expect(page.getByText("2 sentidos").first()).toBeVisible();
});

test("mostra página de não encontrado para palavra inexistente", async ({ page }) => {
  await page.goto("/palavras/nao-existe/");
  await expect(page).toHaveTitle(/Palavra não encontrada/);
});
