"use client";

/**
 * Contribuições da comunidade (rotas /api/contributions). Exigem login; para
 * sugerir, também e-mail verificado.
 */
import { ErroApi } from "./api/erros";
import type {
  ContribuicaoApi,
  ContribuicaoCriadaApi,
  EnvioPreparadoApi,
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
  /** Vídeo em Libras enviado pela pessoa; sem vídeo, o pedido é de gravação pela equipe. */
  video: File | null;
};

/** Versão do texto do termo de autorização de imagem mostrado no formulário. */
export const VERSAO_TERMO_IMAGEM = "2026-11";

/** Tipos de vídeo aceitos pela API; arquivos sem tipo são reconhecidos pela extensão. */
const TIPOS_VIDEO: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

function tipoDoVideo(arquivo: File) {
  if (Object.values(TIPOS_VIDEO).includes(arquivo.type)) return arquivo.type;
  const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
  return TIPOS_VIDEO[extensao] ?? arquivo.type;
}

/** Progresso do envio de um vídeo: índice do sentido e fração enviada (0 a 1). */
export type AoProgredir = (indice: number, fracao: number) => void;

/**
 * Envia o arquivo direto ao armazenamento (não passa pela API): pede um
 * endereço temporário à API e faz o PUT com o tipo informado. Usa
 * XMLHttpRequest para acompanhar o progresso. Devolve a chave do vídeo.
 */
async function enviarVideo(
  arquivo: File,
  aoProgredir: (fracao: number) => void,
): Promise<string> {
  const tipo = tipoDoVideo(arquivo);
  const preparado = await requisitarAutenticado<EnvioPreparadoApi>(
    "/api/contributions/uploads",
    {
      metodo: "POST",
      corpo: { kind: "VIDEO", contentType: tipo, sizeBytes: arquivo.size },
    },
  );
  await new Promise<void>((resolver, rejeitar) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", preparado.uploadUrl);
    for (const [nome, valor] of Object.entries(preparado.headers)) {
      xhr.setRequestHeader(nome, valor);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) aoProgredir(e.loaded / e.total);
    };
    const falhou = () =>
      rejeitar(
        new ErroApi(
          xhr.status || 0,
          "Não foi possível enviar o vídeo. Verifique a conexão e tente de novo.",
        ),
      );
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolver() : falhou();
    xhr.onerror = falhou;
    xhr.ontimeout = falhou;
    xhr.send(arquivo);
  });
  aoProgredir(1);
  return preparado.key;
}

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
 * sugestão. Sentido com vídeo: primeiro o arquivo vai para o armazenamento,
 * depois a sugestão segue com a chave dele e o aceite do termo. Sem vídeo, é
 * um pedido de gravação pela equipe. A imagem ainda não é enviada.
 */
export async function enviarContribuicao(
  nova: NovaContribuicao,
  aoProgredir?: AoProgredir,
): Promise<ResultadoEnvio> {
  const enviados: ContribuicaoCriadaApi[] = [];
  for (const [indice, sentido] of nova.sentidos.entries()) {
    try {
      const videoKey = sentido.video
        ? await enviarVideo(sentido.video, (f) => aoProgredir?.(indice, f))
        : null;
      const corpo: ContribuicaoApi = {
        term: nova.termo.trim(),
        title: sentido.nome.trim(),
        explanation: sentido.definicao.trim(),
        example: sentido.exemplo.trim() || null,
        grammaticalClass: nova.classeGramatical.trim() || null,
        ...(videoKey
          ? {
              mode: "VIDEO_UPLOAD" as const,
              videoKey,
              // O formulário só deixa enviar vídeo com o termo marcado.
              consentAccepted: true,
              consentVersion: VERSAO_TERMO_IMAGEM,
            }
          : { mode: "RECORDING_REQUEST" as const }),
      };
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
