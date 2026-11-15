"use client";

import { useEffect, useRef, useState } from "react";
import { categoriasDe, ordenarAZ, type Palavra } from "@/lib/palavras";
import { Botao } from "./ui";

export type EstadoFiltros = {
  ordenadoAZ: boolean;
  categoria: string | null;
};

export function aplicarFiltros(lista: Palavra[], filtros: EstadoFiltros) {
  const filtrada = filtros.categoria
    ? lista.filter((p) => p.categoria === filtros.categoria)
    : lista;
  return filtros.ordenadoAZ ? ordenarAZ(filtrada) : filtrada;
}

/** Botões "A–Z" e "Categoria" (.filter-group). */
export function FiltrosResultado({
  palavras,
  filtros,
  aoMudar,
  noPainelLateral = false,
}: {
  palavras: Palavra[];
  filtros: EstadoFiltros;
  aoMudar: (filtros: EstadoFiltros) => void;
  noPainelLateral?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const grupo = useRef<HTMLDivElement>(null);
  const categorias = categoriasDe(palavras);
  const classeBotao = noPainelLateral ? "flex-1" : "phone:flex-1";

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !grupo.current?.contains(e.target as Node)
      ) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", fechar);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", fechar);
    };
  }, [aberto]);

  return (
    <div
      ref={grupo}
      className={`relative flex gap-[10px] ${noPainelLateral ? "" : "phone:w-full"}`}
    >
      <Botao
        variante="secondary"
        icone="filter"
        compacto={noPainelLateral}
        className={classeBotao}
        aria-pressed={filtros.ordenadoAZ}
        onClick={() => aoMudar({ ...filtros, ordenadoAZ: !filtros.ordenadoAZ })}
      >
        A–Z
      </Botao>
      <Botao
        variante="secondary"
        icone="filter"
        compacto={noPainelLateral}
        className={classeBotao}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
      >
        {filtros.categoria ?? "Categoria"}
      </Botao>

      {aberto && (
        <div
          role="menu"
          aria-label="Filtrar por categoria"
          className="absolute top-full right-0 z-10 mt-2 flex min-w-56 flex-col rounded-[14px] border border-line bg-white p-2 text-ink shadow-card"
        >
          {[null, ...categorias].map((categoria) => {
            const ativo = filtros.categoria === categoria;
            return (
              <button
                key={categoria ?? "todas"}
                type="button"
                role="menuitemradio"
                aria-checked={ativo}
                className={`flex min-h-12 items-center rounded-[10px] px-3 text-left font-bold hover:bg-blue-soft ${
                  ativo ? "bg-blue-soft text-blue" : "text-navy"
                }`}
                onClick={() => {
                  aoMudar({ ...filtros, categoria });
                  setAberto(false);
                }}
              >
                {categoria ?? "Todas as categorias"}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
