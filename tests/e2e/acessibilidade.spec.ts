import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import type { Usuario } from "../../lib/api/tipos";
import { MODERADOR, USUARIO, usarApiFalsa } from "./api-falsa";

/**
 * Verificação automática de acessibilidade com o axe-core, contra os critérios
 * da WCAG 2.1 níveis A e AA, em todas as telas do site. Cada tela é verificada
 * no modo normal e no modo de alto contraste, já com o conteúdo carregado.
 */
const CRITERIOS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

type Tela = {
  nome: string;
  caminho: string;
  /** Título (h1) que indica que a tela terminou de carregar. */
  titulo: RegExp;
  usuario?: Usuario;
};

const TELAS: Tela[] = [
  { nome: "início", caminho: "/", titulo: /Uma palavra/ },
  { nome: "busca", caminho: "/busca?q=banco", titulo: /Encontre uma palavra/ },
  { nome: "palavra", caminho: "/palavras/banco/", titulo: /BANCO/ },
  { nome: "dicionário", caminho: "/palavras", titulo: /Todas as palavras/ },
  { nome: "não encontrado", caminho: "/pagina-que-nao-existe/", titulo: /./ },
  { nome: "entrar", caminho: "/entrar", titulo: /Entre para contribuir/ },
  { nome: "cadastrar", caminho: "/cadastrar", titulo: /./ },
  { nome: "verificar e-mail", caminho: "/verificar-email?token=abc", titulo: /./ },
  { nome: "contribuir", caminho: "/contribuir", titulo: /Compartilhe uma palavra/, usuario: USUARIO },
  { nome: "contribuição enviada", caminho: "/contribuir/enviado", titulo: /enviada com sucesso/ },
  { nome: "minhas contribuições", caminho: "/contribuir/minhas", titulo: /Minhas contribuições/, usuario: USUARIO },
  { nome: "moderação", caminho: "/moderacao", titulo: /Contribuições para revisar/, usuario: MODERADOR },
  { nome: "gestão de usuários", caminho: "/moderacao/usuarios", titulo: /Gestão de usuários/, usuario: MODERADOR },
];

async function verificar(page: Page) {
  const resultado = await new AxeBuilder({ page }).withTags(CRITERIOS).analyze();
  // Resumo legível de cada violação: regra, impacto e elementos afetados.
  const resumo = resultado.violations.map((v) => ({
    regra: v.id,
    impacto: v.impact,
    descricao: v.help,
    elementos: v.nodes.map((n) => ({
      seletor: n.target.join(" "),
      html: n.html.slice(0, 200),
      motivo: n.failureSummary,
    })),
  }));
  expect(resumo).toEqual([]);
}

for (const altoContraste of [false, true]) {
  test.describe(altoContraste ? "alto contraste" : "modo normal", () => {
    for (const tela of TELAS) {
      test(`${tela.nome} (${tela.caminho})`, async ({ page }) => {
        await usarApiFalsa(page, {
          logado: Boolean(tela.usuario),
          usuario: tela.usuario,
        });
        if (altoContraste) {
          await page.addInitScript(() =>
            window.localStorage.setItem("dicionario:alto-contraste", "true"),
          );
        }
        await page.goto(tela.caminho);
        await expect(page.getByRole("heading", { level: 1, name: tela.titulo })).toBeVisible();
        if (altoContraste) await expect(page.locator("html")).toHaveClass(/high-contrast/);
        await verificar(page);
      });
    }
  });
}
