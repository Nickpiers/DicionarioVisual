import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErroApi } from "@/lib/api/erros";

const replace = vi.fn();
let parametros = new URLSearchParams();
const entrar = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => parametros,
}));
vi.mock("@/lib/sessao", () => ({
  entrar: (...args: unknown[]) => entrar(...args),
  useSessao: () => ({ status: "anonimo" }),
}));

const { FormularioEntrada } = await import("@/components/formulario-entrada");

beforeEach(() => {
  replace.mockReset();
  entrar.mockReset();
  parametros = new URLSearchParams();
});

async function preencherEEnviar() {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText("E-mail *"), "ana@exemplo.com");
  await usuario.type(screen.getByLabelText("Senha *"), "segredo123");
  await usuario.click(screen.getByRole("button", { name: /Entrar/ }));
}

describe("FormularioEntrada", () => {
  it("entra e segue para o destino informado", async () => {
    parametros = new URLSearchParams({ para: "/contribuir/minhas" });
    entrar.mockResolvedValue({});
    render(<FormularioEntrada />);

    await preencherEEnviar();

    expect(entrar).toHaveBeenCalledWith("ana@exemplo.com", "segredo123");
    expect(replace).toHaveBeenCalledWith("/contribuir/minhas");
  });

  it("ignora destinos externos", async () => {
    parametros = new URLSearchParams({ para: "//site-malicioso.com" });
    entrar.mockResolvedValue({});
    render(<FormularioEntrada />);

    await preencherEEnviar();

    expect(replace).toHaveBeenCalledWith("/contribuir");
  });

  it("mostra a mensagem de erro da API e não sai da tela", async () => {
    entrar.mockRejectedValue(new ErroApi(401, "E-mail ou senha incorretos."));
    render(<FormularioEntrada />);

    await preencherEEnviar();

    expect(screen.getByRole("alert").textContent).toContain(
      "E-mail ou senha incorretos.",
    );
    expect(replace).not.toHaveBeenCalled();
    expect(
      (screen.getByRole("button", { name: "Entrar e continuar" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("mostra o texto da moderação quando o destino é /moderacao", () => {
    parametros = new URLSearchParams({ para: "/moderacao" });
    render(<FormularioEntrada />);
    expect(
      screen.getByRole("heading", { name: "Acesso à moderação" }),
    ).toBeTruthy();
  });
});
