"use client";

import { useSyncExternalStore } from "react";

/**
 * Pequeno store sobre o localStorage, compatível com SSR via
 * useSyncExternalStore. Falhas de acesso (modo privado etc.) caem no padrão.
 */
export function criarStore<T>(chave: string, padrao: T) {
  const ouvintes = new Set<() => void>();
  let bruto: string | null | undefined;
  let valor: T = padrao;

  function ler(): T {
    let atual: string | null = null;
    try {
      atual = window.localStorage.getItem(chave);
    } catch {}
    if (atual !== bruto) {
      bruto = atual;
      try {
        valor = atual === null ? padrao : (JSON.parse(atual) as T);
      } catch {
        valor = padrao;
      }
    }
    return valor;
  }

  function gravar(novo: T) {
    try {
      window.localStorage.setItem(chave, JSON.stringify(novo));
    } catch {}
    ouvintes.forEach((o) => o());
  }

  function inscrever(ouvinte: () => void) {
    ouvintes.add(ouvinte);
    const aoMudar = (e: StorageEvent) => e.key === chave && ouvinte();
    window.addEventListener("storage", aoMudar);
    return () => {
      ouvintes.delete(ouvinte);
      window.removeEventListener("storage", aoMudar);
    };
  }

  return { inscrever, ler, gravar, padrao };
}

/* Alto contraste ------------------------------------------------------ */

const contraste = criarStore<boolean>("dicionario:alto-contraste", false);

export function useAltoContraste() {
  return useSyncExternalStore(
    contraste.inscrever,
    contraste.ler,
    () => contraste.padrao,
  );
}

export function definirAltoContraste(ativo: boolean) {
  contraste.gravar(ativo);
}

/* Buscas recentes ----------------------------------------------------- */

/** Resumo da palavra consultada, para listar sem depender da API. */
export type Recente = { slug: string; titulo: string; sentidos: number };

const recentes = criarStore<unknown>("dicionario:recentes", []);
const SEM_RECENTES: Recente[] = [];
let ultimoBruto: unknown;
let ultimos: Recente[] = SEM_RECENTES;

/** Ignora formatos antigos (lista de slugs) ou corrompidos. */
function lerRecentes(): Recente[] {
  const bruto = recentes.ler();
  if (bruto !== ultimoBruto) {
    ultimoBruto = bruto;
    ultimos = Array.isArray(bruto)
      ? bruto.filter(
          (r): r is Recente =>
            typeof r === "object" &&
            r !== null &&
            typeof r.slug === "string" &&
            typeof r.titulo === "string" &&
            typeof r.sentidos === "number",
        )
      : SEM_RECENTES;
  }
  return ultimos;
}

export function useRecentes() {
  return useSyncExternalStore(
    recentes.inscrever,
    lerRecentes,
    () => SEM_RECENTES,
  );
}

export function registrarRecente(recente: Recente) {
  const atuais = lerRecentes().filter((r) => r.slug !== recente.slug);
  recentes.gravar([recente, ...atuais].slice(0, 10));
}

/* Hidratação ---------------------------------------------------------- */

const nada = () => () => {};

/** `false` no servidor e durante a hidratação; `true` depois, no cliente. */
export function useHidratado() {
  return useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
}
