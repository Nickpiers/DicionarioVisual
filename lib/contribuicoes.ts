"use client";

/**
 * Contribuições da comunidade (rotas /api/contributions). Exigem login; para
 * sugerir, também e-mail verificado.
 */
import { ErroApi } from "./api/erros";
import type {
  ContribuicaoApi,
  ContribuicaoCriadaApi,
  MinhaContribuicaoApi,
  SituacaoSentido,
} from "./api/tipos";
import { requisitarAutenticado } from "./sessao";

/** Classes gramaticais oferecidas no formulário (campo livre na API). */
export const classesGramaticais = [
  "substantivo",
  "verbo",
  "adjetivo",
  "advérbio",
  "pronome",
  "preposição",
  "conjunção",
  "interjeição",
  "numeral",
  "expressão",
];

export type NovoSentido = {
  nome: string;
  definicao: string;
  exemplo: string;
};

export type NovaContribuicao = {
  termo: string;
  classeGramatical: string;
  sentidos: NovoSentido[];
};

export type ResultadoEnvio = {
  enviados: ContribuicaoCriadaApi[];
  /** Erro do primeiro sentido que falhou; os seguintes não são enviados. */
  falha: { indice: number; erro: ErroApi } | null;
};

/**
 * A API recebe um sentido por vez, então cada sentido do formulário vira uma
 * sugestão. Por enquanto só existe o modo "pedir gravação à equipe"; o envio
 * de vídeo e imagem ainda não está disponível na API.
 */
export async function enviarContribuicao(
  nova: NovaContribuicao,
): Promise<ResultadoEnvio> {
  const enviados: ContribuicaoCriadaApi[] = [];
  for (const [indice, sentido] of nova.sentidos.entries()) {
    const corpo: ContribuicaoApi = {
      term: nova.termo.trim(),
      title: sentido.nome.trim(),
      explanation: sentido.definicao.trim(),
      example: sentido.exemplo.trim() || null,
      grammaticalClass: nova.classeGramatical.trim() || null,
      mode: "RECORDING_REQUEST",
    };
    try {
      enviados.push(
        await requisitarAutenticado<ContribuicaoCriadaApi>(
          "/api/contributions",
          { metodo: "POST", corpo },
        ),
      );
    } catch (erro) {
      return {
        enviados,
        falha: {
          indice,
          erro: erro instanceof ErroApi ? erro : new ErroApi(0, String(erro)),
        },
      };
    }
  }
  return { enviados, falha: null };
}

export async function listarMinhasContribuicoes() {
  const resposta = await requisitarAutenticado<{
    items: MinhaContribuicaoApi[];
  }>("/api/contributions/mine");
  return resposta.items;
}

/* Apresentação -------------------------------------------------------- */

export const rotuloSituacao: Record<SituacaoSentido, string> = {
  PENDING: "Em análise",
  IN_RECORDING: "Em gravação",
  APPROVED: "Publicado",
  REJECTED: "Não aprovado",
};

export const corSituacao: Record<SituacaoSentido, string> = {
  PENDING: "bg-[#fff1c7] text-[#884008]",
  IN_RECORDING: "bg-blue-soft text-navy",
  APPROVED: "bg-[#e8f8ef] text-[#075d39]",
  REJECTED: "bg-[#fff0ee] text-red",
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "2026-05-22T14:03:00Z" → "22 de maio de 2026" */
export function formatarData(iso: string | null | undefined) {
  if (!iso) return "";
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "" : formatoData.format(data);
}

const formatoDataCurta = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "2026-05-22T14:03:00Z" → "22 de mai. de 2026" */
export function formatarDataCurta(iso: string | null | undefined) {
  if (!iso) return "";
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "" : formatoDataCurta.format(data);
}

/** "Ana Souza" → "AS" */
export function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
    .join("");
}
