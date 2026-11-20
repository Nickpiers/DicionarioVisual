"use client";

import { listarPalavras, useCarregar } from "@/lib/api/publico";
import { Dicionario } from "./dicionario";
import { classeSecao } from "./ui";

/** Página "Todas as palavras": carrega a lista no navegador e mostra o dicionário. */
export function DicionarioCarregado() {
  const carregamento = useCarregar("todas", () => listarPalavras());
  if (carregamento.estado === "pronto") {
    return <Dicionario palavras={carregamento.dados} />;
  }
  if (carregamento.estado === "erro") throw carregamento.erro;
  return (
    <main>
      <section className={classeSecao}>
        <p role="status" className="m-0 text-muted">
          Carregando palavras…
        </p>
      </section>
    </main>
  );
}
