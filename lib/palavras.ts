import type { FonteSentido, SenseApi, WordDetailApi } from "./api/tipos";

export type Sentido = {
  id: string;
  /** Nome curto do sentido (ex.: "Instituição financeira"). */
  curto: string;
  /** Título completo (ex.: "Banco — Instituição financeira"). */
  titulo: string;
  definicao: string;
  exemplo: string | null;
  /** Classe gramatical (ex.: "substantivo"); vazio quando não informada. */
  categoria: string;
  /** Endereço completo da imagem ilustrativa, quando houver. */
  imagem: string | null;
  /** Id do vídeo em Libras no YouTube, quando houver. */
  video: string | null;
  fonte: FonteSentido;
};

export type Palavra = {
  slug: string;
  /** Termo em caixa alta, como no design (ex.: "BANCO"). */
  titulo: string;
  /** Classe gramatical predominante entre os sentidos. */
  categoria: string;
  /** Resumo dos sentidos, para os cartões e o painel lateral. */
  descricao: string;
  sentidos: Sentido[];
};

/** Busca padrão do design quando nenhum termo é informado. */
export const BUSCA_PADRAO = "BANCO";

/** Remove acentos e diferença entre maiúsculas e minúsculas. */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** "substantivo" → "Substantivo"; "BANCO DE DADOS" → "Banco de dados" */
export function capitalizar(titulo: string) {
  const minusculo = titulo.toLocaleLowerCase("pt-BR");
  return minusculo.charAt(0).toLocaleUpperCase("pt-BR") + minusculo.slice(1);
}

export function contarSentidos(palavra: Palavra) {
  const n = palavra.sentidos.length;
  return `${n} ${n === 1 ? "sentido" : "sentidos"}`;
}

/* Conversão do contrato da API ---------------------------------------- */

function paraSentido(termo: string, s: SenseApi): Sentido {
  return {
    id: s.senseId,
    curto: s.title,
    titulo: `${capitalizar(termo)} — ${s.title.toLocaleLowerCase("pt-BR")}`,
    definicao: s.explanation,
    exemplo: s.example?.trim() || null,
    categoria: s.grammaticalClass?.trim()
      ? capitalizar(s.grammaticalClass)
      : "",
    imagem: s.imageUrl || null,
    video: s.youtubeVideoId || null,
    fonte: s.source,
  };
}

/** Classe gramatical mais frequente entre os sentidos. */
function categoriaPredominante(sentidos: Sentido[]) {
  const contagem = new Map<string, number>();
  for (const { categoria } of sentidos) {
    if (categoria) contagem.set(categoria, (contagem.get(categoria) ?? 0) + 1);
  }
  let melhor = "";
  let maior = 0;
  for (const [categoria, n] of contagem) {
    if (n > maior) [melhor, maior] = [categoria, n];
  }
  return melhor;
}

function resumir(termo: string, sentidos: Sentido[]) {
  if (sentidos.length === 0) return "Ainda sem sentidos publicados.";
  const nomes = sentidos.map((s) => s.curto.toLocaleLowerCase("pt-BR"));
  const lista =
    nomes.length === 1
      ? nomes[0]
      : `${nomes.slice(0, -1).join(", ")} ou ${nomes.at(-1)}`;
  return `${capitalizar(termo)} pode significar: ${lista}.`;
}

/** Palavra do contrato (lista ou detalhe) → palavra do front. */
export function paraPalavra(palavra: WordDetailApi): Palavra {
  const sentidos = palavra.senses.map((s) => paraSentido(palavra.term, s));
  return {
    slug: palavra.wordId,
    titulo: palavra.term.toLocaleUpperCase("pt-BR"),
    categoria: categoriaPredominante(sentidos),
    descricao: resumir(palavra.term, sentidos),
    sentidos,
  };
}

/* Filtros feitos no navegador ----------------------------------------- */

/** Classes gramaticais distintas, para o filtro de resultados. */
export function categoriasDe(lista: Palavra[]) {
  return [...new Set(lista.map((p) => p.categoria).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
}

export function ordenarAZ(lista: Palavra[]) {
  return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}

/** Letras do filtro do dicionário: iniciais das palavras recebidas. */
export function letrasDe(lista: Palavra[]) {
  return [
    ...new Set(lista.map((p) => normalizar(p.titulo).charAt(0).toUpperCase())),
  ].sort();
}

/** Filtro do dicionário: uma letra filtra pela inicial; texto, por conteúdo. */
export function filtrarDicionario(lista: Palavra[], filtro: string) {
  const alvo = normalizar(filtro);
  const ordenada = ordenarAZ(lista);
  if (!alvo) return ordenada;
  if (alvo.length === 1) {
    return ordenada.filter((p) => normalizar(p.titulo).startsWith(alvo));
  }
  return ordenada.filter((p) => normalizar(p.titulo).includes(alvo));
}

/* Imagens locais ------------------------------------------------------ */

export const IMAGEM_APOIO_PADRAO = {
  src: "/imagens/sinalizante.jpg",
  alt: "",
};

/** Texto sobre a origem do conteúdo do sentido. */
export const textoDaFonte: Record<FonteSentido, string> = {
  INES: "Conteúdo revisado pela equipe do projeto • Referência terminológica: INES",
  EQUIPE: "Conteúdo produzido e revisado pela equipe do projeto",
  COLABORADOR: "Sugerido pela comunidade e revisado pela equipe do projeto",
};
