/**
 * Erro de uma chamada à API. O contrato devolve erros no formato Problem
 * Details (RFC 9457); `detail` é a mensagem para mostrar à pessoa.
 */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
    readonly titulo?: string,
  ) {
    super(detail);
    this.name = "ErroApi";
  }
}

const MENSAGENS_PADRAO: Record<number, string> = {
  400: "Confira os dados informados e tente de novo.",
  401: "Sua sessão terminou. Entre novamente para continuar.",
  403: "Você não tem permissão para fazer isso.",
  404: "Não encontramos o que você procurou.",
  409: "Os dados mudaram enquanto você editava. Recarregue e tente de novo.",
  423: "Conta bloqueada temporariamente. Tente de novo em alguns minutos.",
  429: "Muitas tentativas seguidas. Aguarde um pouco e tente de novo.",
};

const MENSAGEM_GENERICA =
  "Não foi possível falar com o servidor. Tente de novo em instantes.";

/**
 * A API devolve o `detail` dos erros com UTF-8 codificado duas vezes
 * ("verificaÃ§Ã£o" em vez de "verificação"). Desfaz isso só quando o texto tem
 * esse padrão e a decodificação é válida; textos corretos passam intactos.
 * Pode ser removido quando o backend corrigir a codificação.
 */
export function corrigirCodificacao(texto: string) {
  if (!/[\u00c3\u00c2][\u0080-\u00bf]/.test(texto)) return texto;
  if ([...texto].some((c) => c.charCodeAt(0) > 0xff)) return texto;
  try {
    const bytes = Uint8Array.from(texto, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return texto;
  }
}

/** Monta um ErroApi a partir de uma resposta sem sucesso. */
export async function erroDaResposta(resposta: Response): Promise<ErroApi> {
  let detail: string | undefined;
  let titulo: string | undefined;
  try {
    const corpo = (await resposta.json()) as { detail?: string; title?: string };
    detail = corpo.detail ? corrigirCodificacao(corpo.detail.trim()) : undefined;
    // Rota que ainda não existe neste ambiente (mensagem interna do servidor).
    if (detail?.startsWith("No static resource")) {
      detail = "Este recurso ainda não está disponível. Tente de novo mais tarde.";
    }
    titulo = corpo.title;
  } catch {}
  return new ErroApi(
    resposta.status,
    detail ?? MENSAGENS_PADRAO[resposta.status] ?? MENSAGEM_GENERICA,
    titulo,
  );
}

/** Falha de rede (sem resposta do servidor). */
export function erroDeRede() {
  return new ErroApi(0, MENSAGEM_GENERICA);
}

/** Mensagem amigável para qualquer erro capturado. */
export function mensagemDeErro(erro: unknown) {
  if (erro instanceof ErroApi) return erro.detail;
  return MENSAGEM_GENERICA;
}
