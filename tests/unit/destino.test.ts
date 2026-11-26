import { describe, expect, it } from "vitest";
import { destinoSeguro } from "@/lib/destino";

describe("destinoSeguro", () => {
  it("aceita caminhos internos", () => {
    expect(destinoSeguro("/moderacao")).toBe("/moderacao");
    expect(destinoSeguro("/busca?q=banco")).toBe("/busca?q=banco");
  });

  it("usa /contribuir quando não há destino", () => {
    expect(destinoSeguro(null)).toBe("/contribuir");
    expect(destinoSeguro("")).toBe("/contribuir");
  });

  it("recusa endereços externos (evita redirecionamento aberto)", () => {
    expect(destinoSeguro("https://site-malicioso.com")).toBe("/contribuir");
    expect(destinoSeguro("//site-malicioso.com")).toBe("/contribuir");
    expect(destinoSeguro("javascript:alert(1)")).toBe("/contribuir");
  });
});
