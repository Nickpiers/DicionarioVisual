"use client";

/**
 * API mockada de contribuições e moderação. Cada função é assíncrona, como
 * será com o backend real; por enquanto, os dados ficam no localStorage.
 */
import { useSyncExternalStore } from "react";
import dados from "@/data/contribuicoes.json";
import {
  criarStore,
  definirSessao,
  type Papel,
  type Sessao,
} from "./armazenamento";

export type Situacao = "Pendente" | "Aprovado" | "Rejeitado";

export type Contribuicao = {
  id: string;
  situacao: Situacao;
  termo: string;
  pessoa: string;
  email: string;
  /** ISO (aaaa-mm-dd) */
  data: string;
  sentido: string;
  categoria: string;
  definicao: string;
  exemplo: string;
  fonte: string;
  arquivoVideo: string;
  arquivoImagem: string;
};

export type CamposEditaveis = Pick<
  Contribuicao,
  | "termo"
  | "sentido"
  | "categoria"
  | "definicao"
  | "exemplo"
  | "fonte"
  | "arquivoVideo"
  | "arquivoImagem"
>;

export type NovoSentido = {
  nome: string;
  definicao: string;
  exemplo: string;
  fonte: string;
  video: "upload" | "comissao";
  arquivoVideo: string | null;
  arquivoImagem: string | null;
};

export type NovaContribuicao = {
  tipo: "palavra" | "sentido";
  termo: string;
  categoria: string;
  email: string;
  sentidos: NovoSentido[];
};

const SEMENTE = dados.contribuicoes as Contribuicao[];
const store = criarStore<Contribuicao[]>("dicionario:contribuicoes", SEMENTE);

export const situacoes: { situacao: Situacao; aba: string }[] = [
  { situacao: "Pendente", aba: "Pendentes" },
  { situacao: "Aprovado", aba: "Aprovados" },
  { situacao: "Rejeitado", aba: "Rejeitados" },
];

export const categoriasDeContribuicao = [
  "Dinheiro e finanças",
  "Cotidiano",
  "Saúde",
  "Tecnologia",
];

export const categoriasDeModeracao = [
  "Dinheiro e finanças",
  "Alimentos",
  "Cotidiano",
  "Saúde",
  "Tecnologia",
];

export function useContribuicoes() {
  return useSyncExternalStore(store.inscrever, store.ler, () => store.padrao);
}

/** "2025-05-22" → "22 maio 2025" */
export function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return `${dia} ${meses[mes - 1]} ${ano}`;
}

/** "Ana Souza" → "AS" */
export function iniciais(nome: string) {
  return nome
    .split(" ")
    .map((parte) => parte[0])
    .join("");
}

/** "ana.souza@exemplo.com" → "Ana Souza" */
function nomeDoEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toLocaleUpperCase("pt-BR") + p.slice(1))
    .join(" ");
}

const resposta = <T>(valor: T) => Promise.resolve(valor);

/* Autenticação ------------------------------------------------------- */

export async function entrar(
  email: string,
  _senha: string,
  papel: Papel,
): Promise<Sessao> {
  const sessao = { papel, email };
  definirSessao(sessao);
  return resposta(sessao);
}

export async function sair() {
  definirSessao(null);
  return resposta(true);
}

/* Contribuições ------------------------------------------------------ */

export async function enviarContribuicao(
  nova: NovaContribuicao,
  sessao: Sessao,
) {
  const hoje = new Date().toISOString().slice(0, 10);
  const pessoa =
    nomeDoEmail(sessao?.email ?? nova.email) || "Pessoa contribuidora";
  const criadas: Contribuicao[] = nova.sentidos.map((s, i) => ({
    id: `c-${Date.now()}-${i}`,
    situacao: "Pendente",
    termo: nova.termo,
    pessoa,
    email: nova.email,
    data: hoje,
    sentido: s.nome,
    categoria: nova.categoria,
    definicao: s.definicao,
    exemplo: s.exemplo,
    fonte: s.fonte,
    arquivoVideo:
      s.video === "comissao"
        ? "Gravação solicitada à comissão"
        : (s.arquivoVideo ?? "Vídeo não enviado"),
    arquivoImagem: s.arquivoImagem ?? "Imagem não enviada",
  }));
  store.gravar([...criadas, ...store.ler()]);
  return resposta(criadas);
}

/* Moderação ---------------------------------------------------------- */

function atualizar(id: string, mudanca: Partial<Contribuicao>) {
  store.gravar(
    store.ler().map((c) => (c.id === id ? { ...c, ...mudanca } : c)),
  );
}

export async function salvarAjustes(id: string, campos: CamposEditaveis) {
  atualizar(id, campos);
  return resposta(true);
}

export async function decidir(
  id: string,
  situacao: Exclude<Situacao, "Pendente">,
  campos: CamposEditaveis,
) {
  atualizar(id, { ...campos, situacao });
  return resposta(true);
}

/** Mais recentes primeiro. */
export function porSituacao(lista: Contribuicao[], situacao: Situacao) {
  return lista
    .filter((c) => c.situacao === situacao)
    .sort((a, b) => b.data.localeCompare(a.data));
}
