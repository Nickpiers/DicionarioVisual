import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { paraPalavra, normalizar, type Palavra } from "../palavras";
import { API_URL } from "./endereco";
import { ErroApi, erroDaResposta, erroDeRede } from "./erros";
import type { SearchResultApi, WordDetailApi, WordListApi } from "./tipos";

/**
 * Consultas públicas feitas no servidor (Server Components), direto na API.
 * Os resultados ficam em cache por alguns minutos: o dicionário muda pouco e
 * a própria busca da API já leva até 5 minutos para refletir uma aprovação.
 */

const TEMPO_LIMITE_MS = 10_000;

async function obterJson<T>(caminho: string): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  } catch {
    throw erroDeRede();
  }
  if (!resposta.ok) throw await erroDaResposta(resposta);
  return (await resposta.json()) as T;
}

/** Todas as palavras publicadas (ou só as de uma letra), em ordem alfabética. */
export async function listarPalavras(letra?: string): Promise<Palavra[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("palavras");

  const palavras: Palavra[] = [];
  let cursor: string | null = null;
  do {
    const parametros = new URLSearchParams({ limit: "100" });
    if (letra) parametros.set("letter", letra);
    if (cursor) parametros.set("cursor", cursor);
    const pagina: WordListApi = await obterJson(`/api/words?${parametros}`);
    palavras.push(...pagina.items.map(paraPalavra));
    cursor = pagina.nextCursor;
  } while (cursor);
  return palavras;
}

/** Detalhe de uma palavra; `null` quando ela não existe. */
export async function obterPalavra(slug: string): Promise<Palavra | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("palavras", `palavra:${slug}`);

  try {
    const detalhe = await obterJson<WordDetailApi>(
      `/api/words/${encodeURIComponent(slug)}`,
    );
    return paraPalavra(detalhe);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return null;
    throw erro;
  }
}

/**
 * Busca aproximada (aceita erros de grafia), do resultado mais relevante para
 * o menos relevante. A busca da API só devolve o termo, então os sentidos de
 * cada resultado vêm do detalhe da palavra (no máximo 10, em paralelo e em
 * cache). Uma única letra lista as palavras daquela inicial.
 */
export async function buscarPalavras(termo: string): Promise<Palavra[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("palavras");

  const texto = termo.trim().slice(0, 50);
  const letra = normalizar(texto);
  if (letra.length === 0) return [];
  if (letra.length === 1) {
    return /^[a-z]$/.test(letra) ? listarPalavras(letra) : [];
  }

  const resultado = await obterJson<SearchResultApi>(
    `/api/words/search?${new URLSearchParams({ q: texto })}`,
  );
  const palavras = await Promise.all(
    resultado.items.map((item) => obterPalavra(item.wordId)),
  );
  return palavras.filter((p): p is Palavra => p !== null);
}
