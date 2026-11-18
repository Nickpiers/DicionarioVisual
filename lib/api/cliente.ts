import { erroDaResposta, erroDeRede } from "./erros";

/**
 * Chamada à API feita no navegador. Sempre pelo proxy `/api` do próprio site
 * (mesmo domínio), com o cookie do refresh token incluído.
 */
export async function requisitar<T = void>(
  caminho: string,
  {
    metodo = "GET",
    corpo,
    token,
  }: { metodo?: string; corpo?: unknown; token?: string } = {},
): Promise<T> {
  const cabecalhos: Record<string, string> = { Accept: "application/json" };
  if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw erroDeRede();
  }

  if (!resposta.ok) throw await erroDaResposta(resposta);
  if (resposta.status === 204) return undefined as T;
  const texto = await resposta.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}
