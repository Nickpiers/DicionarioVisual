import { expect, test } from "@playwright/test";
import { USUARIO, usarApiFalsa } from "./api-falsa";

test("envia uma nova palavra com pedido de gravação", async ({ page }) => {
  const api = await usarApiFalsa(page, { logado: true });
  await page.goto("/contribuir");

  await page.getByLabel("Termo ou palavra *").fill("Escola");
  await page.getByLabel("Classe gramatical *").selectOption("substantivo");
  await page.getByLabel("Nome do sentido *").fill("Lugar de estudo");
  await page.getByLabel("Definição em português *").fill("Lugar onde as pessoas aprendem.");
  await page.getByLabel(/Confirmo que as informações são verdadeiras/).check();
  await page.getByRole("button", { name: "Enviar para aprovação" }).click();

  await expect(page).toHaveURL(/\/contribuir\/enviado/);
  await expect(
    page.getByRole("heading", { name: "Sua contribuição foi enviada com sucesso!" }),
  ).toBeVisible();

  expect(api.contribuicoes).toEqual([
    {
      term: "Escola",
      title: "Lugar de estudo",
      explanation: "Lugar onde as pessoas aprendem.",
      example: null,
      grammaticalClass: "substantivo",
      mode: "RECORDING_REQUEST",
    },
  ]);
});

test("e-mail não verificado não consegue enviar", async ({ page }) => {
  await usarApiFalsa(page, {
    logado: true,
    usuario: { ...USUARIO, emailVerified: false },
  });
  await page.goto("/contribuir");

  await expect(page.getByRole("button", { name: "Enviar para aprovação" })).toBeDisabled();
  await expect(page.getByText("Confirme seu e-mail para liberar o envio.")).toBeVisible();
});
