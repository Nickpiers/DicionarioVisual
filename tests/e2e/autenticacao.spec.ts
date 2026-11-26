import { expect, test } from "@playwright/test";
import { SENHA_CORRETA, USUARIO, usarApiFalsa } from "./api-falsa";

test("área protegida leva ao login e volta depois de entrar", async ({ page }) => {
  await usarApiFalsa(page);
  await page.goto("/contribuir/minhas");

  await expect(page).toHaveURL(/\/entrar\/?\?para=%2Fcontribuir%2Fminhas/);

  await page.getByLabel("E-mail *").fill(USUARIO.email);
  await page.getByLabel("Senha *").fill(SENHA_CORRETA);
  await page.getByRole("button", { name: "Entrar e continuar" }).click();

  await expect(page).toHaveURL(/\/contribuir\/minhas/);
});

test("senha errada mostra o erro e não entra", async ({ page }) => {
  await usarApiFalsa(page);
  await page.goto("/entrar");

  await page.getByLabel("E-mail *").fill(USUARIO.email);
  await page.getByLabel("Senha *").fill("errada");
  await page.getByRole("button", { name: "Entrar e continuar" }).click();

  // O Next.js injeta em toda página um `role="alert"` vazio (o anunciador de
  // rotas para leitores de tela), então o alerta é localizado pelo texto.
  await expect(
    page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/entrar/);
});

test("conta comum não acessa a moderação", async ({ page }) => {
  await usarApiFalsa(page, { logado: true });
  await page.goto("/moderacao");
  await expect(
    page.getByRole("heading", { name: "Sua conta não tem acesso a esta área." }),
  ).toBeVisible();
});
