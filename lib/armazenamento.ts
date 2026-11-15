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

export const RECENTES_PADRAO = ["banco", "manga", "casa"];
const recentes = criarStore<string[]>("dicionario:recentes", RECENTES_PADRAO);

export function useRecentes() {
  return useSyncExternalStore(
    recentes.inscrever,
    recentes.ler,
    () => recentes.padrao,
  );
}

export function registrarRecente(slug: string) {
  const atuais = recentes.ler().filter((s) => s !== slug);
  recentes.gravar([slug, ...atuais].slice(0, 10));
}

/* Sessão (login mockado) ---------------------------------------------- */

export type Papel = "user" | "admin";
export type Sessao = { papel: Papel; email: string } | null;

const sessao = criarStore<Sessao>("dicionario:sessao", null);

export function useSessao() {
  return useSyncExternalStore(
    sessao.inscrever,
    sessao.ler,
    () => sessao.padrao,
  );
}

export function lerSessao() {
  return sessao.ler();
}

export function definirSessao(nova: Sessao) {
  sessao.gravar(nova);
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
