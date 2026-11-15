const ID_YOUTUBE = /^[\w-]{11}$/;

/**
 * Extrai o id de um link do YouTube. Aceita os formatos usados no cadastro:
 * `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID` e
 * `youtube.com/shorts/ID`. Retorna `null` se o link não for do YouTube.
 */
export function idDoYoutube(link: string | null | undefined): string | null {
  if (!link) return null;

  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, tipo, valor] = url.pathname.split("/");
    id = tipo === "watch" ? url.searchParams.get("v") : tipo === "embed" || tipo === "shorts" ? valor : null;
  }

  return id && ID_YOUTUBE.test(id) ? id : null;
}

/** Endereço do player incorporado, sem cookies de rastreamento. */
export function urlEmbedYoutube(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}
