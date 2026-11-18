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
