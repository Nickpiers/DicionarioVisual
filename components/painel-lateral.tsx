"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { buscarPorTermo, type Palavra } from "@/lib/palavras";
import { CampoBusca } from "./campo-busca";
import {
  aplicarFiltros,
  FiltrosResultado,
  type EstadoFiltros,
} from "./filtros-resultado";
import { classeEyebrow, Eyebrow, IconeSinal } from "./ui";

/** Painel "Buscar outra palavra" que respeita o termo da busca (?q=). */
export function PainelLateral({ palavra }: { palavra: Palavra }) {
  const consulta = useSearchParams().get("q")?.trim() || palavra.titulo;
  return (
    <PainelLateralBase key={consulta} palavra={palavra} consulta={consulta} />
  );
}

export function PainelLateralBase({
  palavra,
  consulta,
}: {
  palavra: Palavra;
  consulta: string;
}) {
  const [filtros, setFiltros] = useState<EstadoFiltros>({
    ordenadoAZ: false,
    categoria: null,
  });
  const encontrados = buscarPorTermo(consulta);
  const resultados = encontrados.length > 0 ? encontrados : [palavra];
  const visiveis = aplicarFiltros(resultados, filtros);
  const sufixo = `?q=${encodeURIComponent(consulta)}`;

  return (
    <aside className="sticky top-24 rounded-[14px] border border-line bg-white p-5 tablet:static tablet:hidden">
      <Eyebrow>Buscar outra palavra</Eyebrow>
      <CampoBusca
        id="search-light"
        claro
        valorInicial={consulta}
        className="mt-2 mb-3"
      />
      <FiltrosResultado
        palavras={resultados}
        filtros={filtros}
        aoMudar={setFiltros}
        noPainelLateral
      />
      <span className={`${classeEyebrow} mt-6 mb-2 block text-blue`}>
        {`Resultados para “${consulta}”`}
      </span>
      {visiveis.map((resultado) => {
        const ativo = resultado.slug === palavra.slug;
        return (
          <Link
            key={resultado.slug}
            href={`/palavras/${resultado.slug}${sufixo}`}
            aria-current={ativo ? "page" : undefined}
            className={`flex min-h-[95px] w-full gap-[10px] rounded-[10px] border p-[10px] text-left ${
              ativo
                ? "border-blue bg-blue-soft"
                : "border-transparent bg-transparent"
            }`}
          >
            <IconeSinal className="size-9" />
            <span>
              <strong className="block text-[.8rem] text-navy">
                {resultado.titulo}
              </strong>
              <small className="mt-1 block text-[.7rem] leading-[1.35] text-muted">
                {resultado.descricao}
              </small>
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
