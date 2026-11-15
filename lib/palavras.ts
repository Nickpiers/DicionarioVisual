import dados from "@/data/palavras.json";

export type ImagemDeApoio = "escritorio" | "sinalizante";

export type Sentido = {
  curto: string;
  titulo: string;
  definicao: string;
  exemplo: string;
  categoria: string;
  imagem: ImagemDeApoio;
  video: string | null;
};

export type Palavra = {
  slug: string;
  titulo: string;
  categoria: string;
  descricao: string;
  sentidos: Sentido[];
};

export const palavras = dados.palavras as Palavra[];

/** Categorias exibidas na página inicial. */
export const categoriasDaHome = ["Dinheiro", "Cotidiano", "Saúde", "Pessoas"];

/** Busca padrão do design quando nenhum termo é informado. */
export const BUSCA_PADRAO = "BANCO";

/** Remove acentos e diferença entre maiúsculas e minúsculas. */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Letras do filtro do dicionário completo: iniciais das palavras cadastradas. */
export const letrasDoFiltro = [
  ...new Set(palavras.map((p) => normalizar(p.titulo).charAt(0).toUpperCase())),
].sort();

export function contarSentidos(palavra: Palavra) {
  const n = palavra.sentidos.length;
  return `${n} ${n === 1 ? "sentido" : "sentidos"}`;
}

/** "BANCO DE DADOS" → "Banco de dados" */
export function capitalizar(titulo: string) {
  const minusculo = titulo.toLocaleLowerCase("pt-BR");
  return minusculo.charAt(0).toLocaleUpperCase("pt-BR") + minusculo.slice(1);
}

export function buscarPalavra(slug: string) {
  return palavras.find((p) => p.slug === slug);
}

/** Palavras cujo título contém o termo buscado. */
export function buscarPorTermo(termo: string) {
  const alvo = normalizar(termo);
  if (!alvo) return [];
  return palavras.filter((p) => normalizar(p.titulo).includes(alvo));
}

/** Palavras da categoria (pela categoria da palavra ou de algum sentido). */
export function buscarPorCategoria(categoria: string) {
  const alvo = normalizar(categoria);
  if (!alvo) return [];
  return palavras.filter(
    (p) =>
      normalizar(p.categoria).includes(alvo) ||
      p.sentidos.some((s) => normalizar(s.categoria).includes(alvo)),
  );
}

/** Categorias distintas das palavras, para o filtro de resultados. */
export function categoriasDe(lista: Palavra[]) {
  return [...new Set(lista.map((p) => p.categoria))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function ordenarAZ(lista: Palavra[]) {
  return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}

/** Filtro do dicionário: uma letra filtra pela inicial; texto, por conteúdo. */
export function filtrarDicionario(filtro: string) {
  const alvo = normalizar(filtro);
  const lista = ordenarAZ(palavras);
  if (!alvo) return lista;
  if (alvo.length === 1) {
    return lista.filter((p) => normalizar(p.titulo).startsWith(alvo));
  }
  return lista.filter((p) => normalizar(p.titulo).includes(alvo));
}

export const imagensDeApoio: Record<
  ImagemDeApoio,
  { src: string; alt: string }
> = {
  escritorio: {
    src: "/imagens/escritorio.jpg",
    alt: "Pessoas utilizando serviços em um ambiente de trabalho",
  },
  sinalizante: {
    src: "/imagens/sinalizante.jpg",
    alt: "Imagem visual de apoio ao significado",
  },
};

export const IMAGEM_SINALIZANTE = "/imagens/sinalizante.jpg";
