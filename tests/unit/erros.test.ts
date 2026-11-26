import { describe, expect, it } from "vitest";
import {
  corrigirCodificacao,
  ErroApi,
  erroDaResposta,
  erroDeRede,
  mensagemDeErro,
} from "@/lib/api/erros";

const respostaJson = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });

describe("corrigirCodificacao", () => {
  it("desfaz UTF-8 codificado duas vezes", () => {
    expect(corrigirCodificacao("verificaÃ§Ã£o")).toBe("verificação");
  });

  it("mantém textos corretos intactos", () => {
    expect(corrigirCodificacao("verificação")).toBe("verificação");
    expect(corrigirCodificacao("sem acento")).toBe("sem acento");
  });

  it("mantém o texto quando a decodificação seria inválida", () => {
    expect(corrigirCodificacao("Ã")).toBe("Ã");
  });
});

describe("erroDaResposta", () => {
  it("usa o detail do Problem Details", async () => {
    const erro = await erroDaResposta(
      respostaJson(400, { title: "Bad Request", detail: " E-mail inválido. " }),
    );
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.status).toBe(400);
    expect(erro.detail).toBe("E-mail inválido.");
    expect(erro.titulo).toBe("Bad Request");
  });

  it("corrige a codificação do detail", async () => {
    const erro = await erroDaResposta(
      respostaJson(403, { detail: "Confirme a verificaÃ§Ã£o" }),
    );
    expect(erro.detail).toBe("Confirme a verificação");
  });

  it("usa a mensagem padrão do status quando não há corpo", async () => {
    const erro = await erroDaResposta(new Response(null, { status: 429 }));
    expect(erro.detail).toMatch(/Muitas tentativas/);
  });

  it("usa a mensagem genérica para status desconhecidos", async () => {
    const erro = await erroDaResposta(new Response("x", { status: 502 }));
    expect(erro.detail).toMatch(/Não foi possível falar com o servidor/);
  });

  it("traduz a mensagem interna de rota inexistente", async () => {
    const erro = await erroDaResposta(
      respostaJson(404, { detail: "No static resource api/x." }),
    );
    expect(erro.detail).toMatch(/ainda não está disponível/);
  });
});

describe("mensagemDeErro", () => {
  it("devolve o detail de um ErroApi", () => {
    expect(mensagemDeErro(new ErroApi(409, "Conflito"))).toBe("Conflito");
  });

  it("devolve a mensagem genérica para outros erros", () => {
    expect(mensagemDeErro(new Error("boom"))).toBe(erroDeRede().detail);
  });
});
