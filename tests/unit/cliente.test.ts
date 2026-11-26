import { describe, expect, it, vi } from "vitest";
import { requisitar } from "@/lib/api/cliente";
import { ErroApi } from "@/lib/api/erros";

function simularFetch(resposta: Response | Error) {
  const fetch = vi.fn(async () => {
    if (resposta instanceof Error) throw resposta;
    return resposta;
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

describe("requisitar", () => {
  it("envia JSON, token e cookies", async () => {
    const fetch = simularFetch(Response.json({ ok: true }));
    const resultado = await requisitar("/api/x", {
      metodo: "POST",
      corpo: { a: 1 },
      token: "abc",
    });
    expect(resultado).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith("/api/x", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer abc",
      },
      body: '{"a":1}',
      credentials: "include",
      cache: "no-store",
    });
  });

  it("devolve undefined em 204", async () => {
    simularFetch(new Response(null, { status: 204 }));
    await expect(requisitar("/api/x")).resolves.toBeUndefined();
  });

  it("transforma respostas de erro em ErroApi", async () => {
    simularFetch(Response.json({ detail: "Senha incorreta." }, { status: 401 }));
    await expect(requisitar("/api/x")).rejects.toMatchObject({
      status: 401,
      detail: "Senha incorreta.",
    });
  });

  it("transforma falha de rede em ErroApi com status 0", async () => {
    simularFetch(new TypeError("Failed to fetch"));
    const erro = await requisitar("/api/x").catch((e) => e);
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.status).toBe(0);
  });
});
