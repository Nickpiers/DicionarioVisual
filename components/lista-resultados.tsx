"use client";

import { useState } from "react";
import type { Palavra } from "@/lib/palavras";
import { CartaoResultado, NenhumaPalavra } from "./cartao-resultado";
import {
  aplicarFiltros,
  FiltrosResultado,
  type EstadoFiltros,
} from "./filtros-resultado";
import { classeCabecalhoResultados, Eyebrow } from "./ui";

/** Cabeçalho, filtros e grade da página de resultados. */
export function ListaResultados({
  palavras,
  rotulo,
  termo,
}: {
  palavras: Palavra[];
  rotulo: string;
  termo?: string;
}) {
  const [filtros, setFiltros] = useState<EstadoFiltros>({
    ordenadoAZ: false,
    categoria: null,
  });
  const visiveis = aplicarFiltros(palavras, filtros);
  const consulta = termo ? `?q=${encodeURIComponent(termo)}` : "";

  return (
    <>
      <div className={classeCabecalhoResultados}>
        <div>
          <Eyebrow>Resultado da busca</Eyebrow>
          <h2 className="mt-1 mb-0">
            {`${visiveis.length} ${visiveis.length === 1 ? "resultado" : "resultados"} para `}
            <span className="text-blue">“{rotulo}”</span>
          </h2>
          <p className="mt-[6px] mb-0 text-muted">
            Escolha uma palavra para ver seus significados e exemplos.
          </p>
        </div>
        <FiltrosResultado
          palavras={palavras}
          filtros={filtros}
          aoMudar={setFiltros}
        />
      </div>
      {visiveis.length > 0 ? (
        <div className="grid grid-cols-3 gap-[18px] tablet:grid-cols-1">
          {visiveis.map((palavra) => (
            <CartaoResultado
              key={palavra.slug}
              palavra={palavra}
              href={`/palavras/${palavra.slug}${consulta}`}
            />
          ))}
        </div>
      ) : (
        <NenhumaPalavra />
      )}
    </>
  );
}
