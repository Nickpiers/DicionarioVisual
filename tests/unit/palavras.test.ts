import { describe, expect, it } from "vitest";
import type { SenseApi, WordDetailApi } from "@/lib/api/tipos";
import {
  capitalizar,
  categoriasDe,
  contarSentidos,
  filtrarDicionario,
  letrasDe,
  normalizar,
  ordenarAZ,
  paraPalavra,
} from "@/lib/palavras";

const sentido = (parcial: Partial<SenseApi> = {}): SenseApi => ({
  senseId: "s1",
  title: "Instituição financeira",
  explanation: "Lugar onde se guarda dinheiro.",
  example: null,
  grammaticalClass: "substantivo",
  youtubeVideoId: null,
  imageUrl: null,
  source: "EQUIPE",
  ...parcial,
});

const palavra = (term: string, senses: SenseApi[] = [sentido()]): WordDetailApi => ({
  wordId: term.toLowerCase(),
  term,
  senses,
});

describe("normalizar", () => {
  it("remove acentos, caixa e espaços nas pontas", () => {
    expect(normalizar("  Ação ")).toBe("acao");
    expect(normalizar("ÁRVORE")).toBe("arvore");
  });
});

describe("capitalizar", () => {
  it("deixa só a primeira letra maiúscula", () => {
    expect(capitalizar("substantivo")).toBe("Substantivo");
    expect(capitalizar("BANCO DE DADOS")).toBe("Banco de dados");
    expect(capitalizar("ÉGUA")).toBe("Égua");
  });
});

describe("paraPalavra", () => {
  it("converte o contrato da API para o formato do front", () => {
    const p = paraPalavra(
      palavra("banco", [
        sentido({ senseId: "a", title: "Instituição financeira", example: "  " }),
        sentido({ senseId: "b", title: "Assento", grammaticalClass: "substantivo" }),
        sentido({ senseId: "c", title: "Apostar", grammaticalClass: "verbo" }),
      ]),
    );
    expect(p.slug).toBe("banco");
    expect(p.titulo).toBe("BANCO");
    expect(p.categoria).toBe("Substantivo");
    expect(p.descricao).toBe(
      "Banco pode significar: instituição financeira, assento ou apostar.",
    );
    expect(p.sentidos[0]).toMatchObject({
      id: "a",
      titulo: "Banco — instituição financeira",
      exemplo: null,
    });
  });

  it("descreve palavras sem sentidos publicados", () => {
    const p = paraPalavra(palavra("casa", []));
    expect(p.descricao).toBe("Ainda sem sentidos publicados.");
    expect(p.categoria).toBe("");
  });

  it("descreve palavras com um único sentido", () => {
    expect(paraPalavra(palavra("casa")).descricao).toBe(
      "Casa pode significar: instituição financeira.",
    );
  });
});

describe("contarSentidos", () => {
  it("usa singular e plural", () => {
    expect(contarSentidos(paraPalavra(palavra("a")))).toBe("1 sentido");
    expect(
      contarSentidos(paraPalavra(palavra("a", [sentido(), sentido()]))),
    ).toBe("2 sentidos");
  });
});

describe("filtros do dicionário", () => {
  const lista = [
    paraPalavra(palavra("Ônibus", [sentido({ grammaticalClass: "substantivo" })])),
    paraPalavra(palavra("Banco", [sentido({ grammaticalClass: "substantivo" })])),
    paraPalavra(palavra("Andar", [sentido({ grammaticalClass: "verbo" })])),
    paraPalavra(palavra("Abacaxi", [sentido({ grammaticalClass: null })])),
  ];

  it("ordena de A a Z respeitando acentos", () => {
    expect(ordenarAZ(lista).map((p) => p.titulo)).toEqual([
      "ABACAXI",
      "ANDAR",
      "BANCO",
      "ÔNIBUS",
    ]);
  });

  it("lista as categorias distintas, sem vazias", () => {
    expect(categoriasDe(lista)).toEqual(["Substantivo", "Verbo"]);
  });

  it("lista as letras iniciais sem acento", () => {
    expect(letrasDe(lista)).toEqual(["A", "B", "O"]);
  });

  it("uma letra filtra pela inicial", () => {
    expect(filtrarDicionario(lista, "a").map((p) => p.titulo)).toEqual([
      "ABACAXI",
      "ANDAR",
    ]);
    expect(filtrarDicionario(lista, "o").map((p) => p.titulo)).toEqual(["ÔNIBUS"]);
  });

  it("texto filtra por conteúdo", () => {
    expect(filtrarDicionario(lista, "nibu").map((p) => p.titulo)).toEqual([
      "ÔNIBUS",
    ]);
  });

  it("sem filtro devolve tudo ordenado", () => {
    expect(filtrarDicionario(lista, "  ")).toHaveLength(4);
  });
});
