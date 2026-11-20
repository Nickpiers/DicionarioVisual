"use client";

import { listarPalavras, useCarregar } from "@/lib/api/publico";
import { FormularioContribuicao } from "./formulario-contribuicao";

/**
 * Formulário de contribuição com as palavras publicadas (para sugerir um novo
 * sentido). Se a lista não carregar, o formulário aparece sem as sugestões.
 */
export function ContribuicaoCarregada() {
  const carregamento = useCarregar("todas", () => listarPalavras());
  if (carregamento.estado === "carregando") return null;
  const palavras =
    carregamento.estado === "pronto"
      ? carregamento.dados.map(({ slug, titulo }) => ({ slug, titulo }))
      : [];
  return <FormularioContribuicao palavras={palavras} />;
}
