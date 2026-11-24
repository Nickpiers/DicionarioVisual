"use client";

/**
 * Envio de arquivo direto ao armazenamento (não passa pela API): a API devolve
 * um endereço temporário assinado com o tipo e o tamanho, e o navegador faz o
 * PUT. Usa XMLHttpRequest para acompanhar o progresso. Devolve a chave do
 * arquivo, que segue no corpo da sugestão ou da aprovação.
 */
import { ErroApi } from "./api/erros";
import type { EnvioPreparadoApi } from "./api/tipos";
import { requisitarAutenticado } from "./sessao";

export async function enviarArquivo(
  rota: string,
  corpo: object,
  arquivo: File,
  mensagemFalha: string,
  aoProgredir?: (fracao: number) => void,
): Promise<string> {
  const preparado = await requisitarAutenticado<EnvioPreparadoApi>(rota, {
    metodo: "POST",
    corpo,
  });
  await new Promise<void>((resolver, rejeitar) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", preparado.uploadUrl);
    for (const [nome, valor] of Object.entries(preparado.headers)) {
      xhr.setRequestHeader(nome, valor);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) aoProgredir?.(e.loaded / e.total);
    };
    const falhou = () => rejeitar(new ErroApi(xhr.status || 0, mensagemFalha));
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolver() : falhou();
    xhr.onerror = falhou;
    xhr.ontimeout = falhou;
    xhr.send(arquivo);
  });
  aoProgredir?.(1);
  return preparado.key;
}

/** Tipo do arquivo pela extensão quando o navegador não informa um tipo aceito. */
export function tipoDoArquivo(arquivo: File, tipos: Record<string, string>) {
  if (Object.values(tipos).includes(arquivo.type)) return arquivo.type;
  const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
  return tipos[extensao] ?? arquivo.type;
}
