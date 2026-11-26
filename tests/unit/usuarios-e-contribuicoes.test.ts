import { describe, expect, it } from "vitest";
import type { AdminUserApi, Perfil } from "@/lib/api/tipos";
import {
  formatarData,
  formatarDataCurta,
  iniciais,
} from "@/lib/contribuicoes";
import { tipoDoArquivo } from "@/lib/envio-arquivo";
import { permissoes } from "@/lib/usuarios";

const conta = (role: Perfil): AdminUserApi => ({
  userId: "u1",
  name: "Ana",
  email: "ana@exemplo.com",
  role,
  status: "ACTIVE",
  emailVerified: true,
  createdAt: "2026-01-01T00:00:00Z",
});

describe("permissoes", () => {
  it("ADMIN só bloqueia contas USER", () => {
    expect(permissoes("ADMIN", conta("USER"), false)).toEqual({
      bloquear: true,
      mudarPerfil: false,
      remover: false,
    });
    expect(permissoes("ADMIN", conta("ADMIN"), false).bloquear).toBe(false);
  });

  it("MASTER muda perfis e remove administradores", () => {
    expect(permissoes("MASTER", conta("ADMIN"), false)).toEqual({
      bloquear: true,
      mudarPerfil: true,
      remover: true,
    });
    expect(permissoes("MASTER", conta("USER"), false).remover).toBe(false);
  });

  it("ninguém altera o MASTER nem a própria conta", () => {
    const nada = { bloquear: false, mudarPerfil: false, remover: false };
    expect(permissoes("MASTER", conta("MASTER"), false)).toEqual(nada);
    expect(permissoes("MASTER", conta("ADMIN"), true)).toEqual(nada);
  });
});

describe("formatação", () => {
  it("formata datas por extenso", () => {
    expect(formatarData("2026-05-22T14:03:00Z")).toBe("22 de maio de 2026");
    expect(formatarDataCurta("2026-05-22T14:03:00Z")).toBe("22 de mai. de 2026");
  });

  it("devolve vazio para datas ausentes ou inválidas", () => {
    expect(formatarData(null)).toBe("");
    expect(formatarData("ontem")).toBe("");
    expect(formatarDataCurta(undefined)).toBe("");
  });

  it("gera as iniciais do nome", () => {
    expect(iniciais("Ana Souza")).toBe("AS");
    expect(iniciais("  maria  da silva ")).toBe("MD");
    expect(iniciais("ícaro")).toBe("Í");
  });
});

describe("tipoDoArquivo", () => {
  const tipos = { mp4: "video/mp4", mov: "video/quicktime" };

  it("mantém o tipo informado pelo navegador quando é aceito", () => {
    const arquivo = new File(["x"], "video.bin", { type: "video/mp4" });
    expect(tipoDoArquivo(arquivo, tipos)).toBe("video/mp4");
  });

  it("deduz o tipo pela extensão quando o navegador não informa", () => {
    const arquivo = new File(["x"], "Gravacao.MOV", { type: "" });
    expect(tipoDoArquivo(arquivo, tipos)).toBe("video/quicktime");
  });
});
