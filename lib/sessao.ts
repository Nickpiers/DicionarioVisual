"use client";

/**
 * Sessão da pessoa logada, seguindo o contrato da API:
 * - o access token fica só em memória (nunca no localStorage);
 * - o refresh token é um cookie HttpOnly que o navegador envia sozinho;
 * - ao abrir o site, a sessão é recuperada com POST /api/auth/refresh;
 * - um 401 numa rota protegida dispara uma renovação e repete a chamada.
 *
 * Cada refresh token vale uma vez, e reutilizar um antigo encerra todas as
 * sessões. Por isso as renovações são únicas por aba (uma promessa
 * compartilhada) e serializadas entre abas (Web Locks): a segunda aba só
 * chama o refresh depois que a primeira já trocou o cookie.
 */
import { useSyncExternalStore } from "react";
import { requisitar } from "./api/cliente";
import { ErroApi } from "./api/erros";
import type { CadastroApi, SessaoApi, Usuario } from "./api/tipos";

export type EstadoSessao =
  | { status: "carregando" }
  | { status: "anonimo" }
  | { status: "autenticado"; usuario: Usuario };

/** Papel exigido pelas áreas protegidas do front. */
export type Papel = "user" | "admin";

const CARREGANDO: EstadoSessao = { status: "carregando" };
const ANONIMO: EstadoSessao = { status: "anonimo" };

let estado: EstadoSessao = CARREGANDO;
let token: string | null = null;
let iniciada = false;
let renovacao: Promise<boolean> | null = null;
const ouvintes = new Set<() => void>();

const canal =
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel("dicionario:sessao");

canal?.addEventListener("message", (evento: MessageEvent<string>) => {
  // Outra aba entrou ou saiu: acompanha sem pedir login de novo.
  if (evento.data === "saiu") definir(null);
  if (evento.data === "entrou" && estado.status !== "autenticado") {
    void renovarSessao();
  }
});

function definir(sessao: SessaoApi | Usuario | null) {
  if (sessao === null) {
    token = null;
    estado = ANONIMO;
  } else if ("accessToken" in sessao) {
    token = sessao.accessToken;
    estado = { status: "autenticado", usuario: sessao.user };
  } else if (estado.status === "autenticado") {
    estado = { status: "autenticado", usuario: sessao };
  }
  ouvintes.forEach((ouvinte) => ouvinte());
}

function comTrava<T>(tarefa: () => Promise<T>): Promise<T> {
  const travas = typeof navigator === "undefined" ? undefined : navigator.locks;
  return travas
    ? (travas.request("dicionario:refresh", tarefa) as Promise<T>)
    : tarefa();
}

/**
 * Pede um novo access token usando o cookie. Devolve `true` se a sessão foi
 * renovada e `false` se não há sessão válida (a pessoa precisa entrar).
 */
export function renovarSessao(): Promise<boolean> {
  renovacao ??= comTrava(async () => {
    try {
      definir(await requisitar<SessaoApi>("/api/auth/refresh", { metodo: "POST" }));
      return true;
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 401) {
        definir(null);
        return false;
      }
      // Falha de rede: sem como saber; trata como sessão ausente só no início.
      if (estado.status === "carregando") definir(null);
      throw erro;
    }
  }).finally(() => {
    renovacao = null;
  });
  return renovacao;
}

function iniciar() {
  if (iniciada) return;
  iniciada = true;
  renovarSessao().catch(() => undefined);
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  iniciar();
  return () => ouvintes.delete(ouvinte);
}

export function useSessao() {
  return useSyncExternalStore(
    inscrever,
    () => estado,
    () => CARREGANDO,
  );
}

export function lerSessao() {
  return estado;
}

/** ADMIN e MASTER acessam a moderação; USER, só a área da comunidade. */
export function ehModerador(usuario: Usuario | undefined) {
  return usuario?.role === "ADMIN" || usuario?.role === "MASTER";
}

export function temPapel(sessao: EstadoSessao, papel: Papel) {
  if (sessao.status !== "autenticado") return false;
  return papel === "admin" ? ehModerador(sessao.usuario) : true;
}

/** Espera a recuperação inicial da sessão, se ainda estiver em andamento. */
async function sessaoPronta() {
  iniciar();
  if (estado.status === "carregando") {
    await (renovacao ?? Promise.resolve()).catch(() => undefined);
  }
}

/**
 * Chamada a uma rota protegida. Envia o access token; num 401, renova a
 * sessão uma vez e repete. Se a renovação também falhar, a sessão termina e
 * o erro 401 sobe para a tela mandar a pessoa ao login.
 */
export async function requisitarAutenticado<T = void>(
  caminho: string,
  opcoes: { metodo?: string; corpo?: unknown } = {},
): Promise<T> {
  await sessaoPronta();
  if (!token) throw new ErroApi(401, "Entre na sua conta para continuar.");
  try {
    return await requisitar<T>(caminho, { ...opcoes, token });
  } catch (erro) {
    if (!(erro instanceof ErroApi) || erro.status !== 401) throw erro;
    const renovada = await renovarSessao().catch(() => false);
    if (!renovada || !token) {
      throw new ErroApi(401, "Sua sessão terminou. Entre novamente para continuar.");
    }
    return requisitar<T>(caminho, { ...opcoes, token });
  }
}

/* Fluxos de conta ----------------------------------------------------- */

export async function entrar(email: string, senha: string) {
  const sessao = await requisitar<SessaoApi>("/api/auth/login", {
    metodo: "POST",
    corpo: { email: email.trim(), password: senha },
  });
  iniciada = true;
  definir(sessao);
  canal?.postMessage("entrou");
  return sessao.user;
}

export async function sair() {
  try {
    await requisitar("/api/auth/logout", { metodo: "POST" });
  } catch {
    // Mesmo se a API falhar, a sessão local termina.
  }
  definir(null);
  canal?.postMessage("saiu");
}

export function cadastrar(dados: CadastroApi) {
  return requisitar<Usuario>("/api/auth/register", {
    metodo: "POST",
    corpo: { ...dados, name: dados.name.trim(), email: dados.email.trim() },
  });
}

export async function verificarEmail(tokenVerificacao: string) {
  await requisitar("/api/auth/verify-email", {
    metodo: "POST",
    corpo: { token: tokenVerificacao },
  });
  // O novo access token já traz emailVerified: true.
  await sessaoPronta();
  if (estado.status === "autenticado") await renovarSessao().catch(() => false);
}

export function reenviarVerificacao() {
  return requisitarAutenticado("/api/auth/resend-verification", {
    metodo: "POST",
  });
}

/** Recarrega os dados da pessoa logada (ex.: depois de verificar o e-mail). */
export async function atualizarUsuario() {
  definir(await requisitarAutenticado<Usuario>("/api/auth/me"));
}
