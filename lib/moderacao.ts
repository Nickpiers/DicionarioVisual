"use client";

/**
 * Moderação das sugestões (rotas /api/admin/moderation e /api/admin/words).
 * Perfis ADMIN e MASTER. Toda decisão envia a `version` da palavra que está
 * na tela; se ela mudou nesse meio tempo, a API responde 409.
 */
import type {
  AdminWordApi,
  AprovacaoApi,
  FilaModeracaoApi,
} from "./api/tipos";
import { enviarArquivo, tipoDoArquivo } from "./envio-arquivo";
import { requisitarAutenticado } from "./sessao";

export function carregarFila(cursor?: string | null) {
  const parametros = new URLSearchParams({ limit: "20" });
  if (cursor) parametros.set("cursor", cursor);
  return requisitarAutenticado<FilaModeracaoApi>(
    `/api/admin/moderation?${parametros}`,
  );
}

export function carregarPalavraAdmin(wordId: string) {
  return requisitarAutenticado<AdminWordApi>(
    `/api/admin/words/${encodeURIComponent(wordId)}`,
  );
}

function acao(wordId: string, senseId: string, nome: string, corpo: object) {
  return requisitarAutenticado<AdminWordApi>(
    `/api/admin/words/${encodeURIComponent(wordId)}/senses/${encodeURIComponent(senseId)}/${nome}`,
    { metodo: "POST", corpo },
  );
}

/** Aceita a sugestão e avisa que a equipe vai gravar o vídeo. */
export function marcarParaGravacao(
  wordId: string,
  senseId: string,
  version: number,
  reviewNote?: string,
) {
  return acao(wordId, senseId, "start-recording", {
    version,
    ...(reviewNote ? { reviewNote } : {}),
  });
}

/** Publica o sentido. O vídeo do YouTube é obrigatório. */
export function aprovar(
  wordId: string,
  senseId: string,
  dados: AprovacaoApi,
) {
  return acao(wordId, senseId, "approve", dados);
}

/** Rejeita o sentido. O motivo é obrigatório (o colaborador lê). */
export function rejeitar(
  wordId: string,
  senseId: string,
  version: number,
  reviewNote: string,
) {
  return acao(wordId, senseId, "reject", { version, reviewNote });
}

/** Tipos de imagem aceitos pela API (até 2 MB). */
const TIPOS_IMAGEM: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

/**
 * Envia a imagem do sentido ao armazenamento. A chave devolvida vai como
 * `imageKey` na aprovação; a API copia a imagem para o site ao publicar.
 */
export function enviarImagem(arquivo: File, aoProgredir?: (fracao: number) => void) {
  const tipo = tipoDoArquivo(arquivo, TIPOS_IMAGEM);
  return enviarArquivo(
    "/api/admin/uploads/image",
    { contentType: tipo, sizeBytes: arquivo.size },
    arquivo,
    "Não foi possível enviar a imagem. Verifique a conexão e tente de novo.",
    aoProgredir,
  );
}
