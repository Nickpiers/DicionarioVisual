"use client";

import { useEffect, useState } from "react";
import { normalizar, paraPalavra, type Palavra } from "../palavras";
import { ErroApi, erroDaResposta, erroDeRede } from "./erros";
import type { SearchResultApi, WordDetailApi, WordListApi } from "./tipos";

/**
 * Consultas públicas feitas no navegador, pelo `/api` do próprio site.
 *
 * O site é publicado como arquivos estáticos (S3 + CloudFront), sem servidor
 * Node, então as palavras são carregadas aqui e não no build: uma palavra
 * aprovada aparece sem precisar publicar o site de novo. Os resultados ficam
 * em memória por alguns minutos para a navegação entre páginas ser rápida.
 */

const TEMPO_LIMITE_MS = 10_000;
const VALIDADE_MS = 2 * 60_000;

const memoria = new Map<string, { ate: number; valor: Promise<unknown> }>();

/** Guarda a promessa (não só o resultado) para pedidos iguais simultâneos não se repetirem. */
function emMemoria<T>(chave: string, carregar: () => Promise<T>): Promise<T> {
  const agora = Date.now();
  const guardado = memoria.get(chave);
  if (guardado && guardado.ate > agora) return guardado.valor as Promise<T>;
  const valor = carregar();
  memoria.set(chave, { ate: agora + VALIDADE_MS, valor });
  // Falhas não ficam guardadas: a próxima tentativa chama a API de novo.
  valor.catch(() => memoria.delete(chave));
  return valor;
}

async function obterJson<T>(caminho: string): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(caminho, {
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
export function listarPalavras(letra?: string): Promise<Palavra[]> {
  return emMemoria(`lista:${letra ?? ""}`, async () => {
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
  });
}

/** Detalhe de uma palavra; `null` quando ela não existe. */
export function obterPalavra(slug: string): Promise<Palavra | null> {
  return emMemoria(`palavra:${slug}`, async () => {
    try {
      const detalhe = await obterJson<WordDetailApi>(
        `/api/words/${encodeURIComponent(slug)}`,
      );
      return paraPalavra(detalhe);
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 404) return null;
      throw erro;
    }
  });
}

/**
 * Busca aproximada (aceita erros de grafia), do resultado mais relevante para
 * o menos relevante. A busca da API só devolve o termo, então os sentidos de
 * cada resultado vêm do detalhe da palavra (no máximo 10, em paralelo).
 * Uma única letra lista as palavras daquela inicial.
 */
export function buscarPalavras(termo: string): Promise<Palavra[]> {
  const texto = termo.trim().slice(0, 50);
  const letra = normalizar(texto);
  if (letra.length === 0) return Promise.resolve([]);
  if (letra.length === 1) {
    return /^[a-z]$/.test(letra) ? listarPalavras(letra) : Promise.resolve([]);
  }
  return emMemoria(`busca:${letra}`, async () => {
    const resultado = await obterJson<SearchResultApi>(
      `/api/words/search?${new URLSearchParams({ q: texto })}`,
    );
    const palavras = await Promise.all(
      resultado.items.map((item) => obterPalavra(item.wordId)),
    );
    return palavras.filter((p): p is Palavra => p !== null);
  });
}

export type Carregamento<T> =
  | { estado: "carregando" }
  | { estado: "pronto"; dados: T }
  | { estado: "erro"; erro: unknown };

/**
 * Carrega dados no navegador e recarrega quando `chave` muda. Resultados de
 * uma chave antiga que chegam atrasados são descartados.
 */
export function useCarregar<T>(
  chave: string | null,
  carregar: () => Promise<T>,
): Carregamento<T> {
  const [resultado, setResultado] = useState<{
    chave: string | null;
    valor: Carregamento<T>;
  }>({ chave: null, valor: { estado: "carregando" } });

  useEffect(() => {
    if (chave === null) return;
    let ativo = true;
    carregar().then(
      (dados) => ativo && setResultado({ chave, valor: { estado: "pronto", dados } }),
      (erro: unknown) => ativo && setResultado({ chave, valor: { estado: "erro", erro } }),
    );
    return () => {
      ativo = false;
    };
    // `carregar` muda a cada renderização; a chave é o que identifica o pedido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return resultado.chave === chave ? resultado.valor : { estado: "carregando" };
}
