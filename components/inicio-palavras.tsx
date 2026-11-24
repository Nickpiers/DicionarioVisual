"use client";

import Link from "next/link";
import { listarPalavras, useCarregar } from "@/lib/api/publico";
import { capitalizar, contarSentidos } from "@/lib/palavras";
import { Icone } from "./icone";
import { classeIconeQuadrado } from "./ui";

/*
 * Partes da página inicial que dependem das palavras publicadas. Carregadas no
 * navegador (o site é estático); somem ou mostram um aviso se a API falhar.
 */

const coresPalavra = [
  "bg-blue-soft text-navy",
  "bg-[#fff5c7] text-[#725200]",
  "bg-orange-soft text-[#8a2d16]",
  "bg-[#f0e9ff] text-[#4b317b]",
];

function usePalavras() {
  return useCarregar("todas", () => listarPalavras());
}

export function SugestaoDeBusca() {
  const carregamento = usePalavras();
  if (carregamento.estado !== "pronto") return null;
  const nomes = carregamento.dados
    .slice(0, 3)
    .map((p) => p.titulo.toLocaleLowerCase("pt-BR"));
  if (nomes.length === 0) return null;
  const lista =
    nomes.length === 1
      ? nomes[0]
      : `${nomes.slice(0, -1).join(", ")} ou ${nomes.at(-1)}`;
  return <>{`Experimente: ${lista}`}</>;
}

export function PalavrasEmDestaque() {
  const carregamento = usePalavras();
  if (carregamento.estado === "carregando") {
    return (
      <p role="status" className="m-0 text-muted">
        Carregando palavras…
      </p>
    );
  }
  const palavras = carregamento.estado === "pronto" ? carregamento.dados.slice(0, 4) : [];
  if (palavras.length === 0) {
    return (
      <p className="m-0 rounded-[14px] border border-line bg-white px-4 py-6 text-muted">
        Não foi possível carregar as palavras agora.{" "}
        <Link href="/palavras" className="font-extrabold text-blue">
          Tente ver a lista completa
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 phone:grid-cols-1">
      {palavras.map((palavra, indice) => (
        <Link
          key={palavra.slug}
          href={`/palavras/${palavra.slug}`}
          className="grid min-h-[76px] grid-cols-[46px_1fr_auto] items-center gap-3 rounded-[14px] border border-line bg-surface px-[14px] py-3 text-left font-bold shadow-[0_3px_12px_rgba(20,55,90,.04)] hover:-translate-y-0.5 hover:border-blue"
        >
          <span
            className={`${classeIconeQuadrado} size-11 ${coresPalavra[indice % coresPalavra.length]}`}
          >
            <Icone nome="hand" />
          </span>
          <span>
            <span className="block">{capitalizar(palavra.titulo)}</span>
            <small className="block font-normal text-muted">
              {contarSentidos(palavra)}
            </small>
          </span>
          <Icone nome="arrow" />
        </Link>
      ))}
    </div>
  );
}

export function TotalDePalavras() {
  const carregamento = usePalavras();
  if (carregamento.estado !== "pronto") return null;
  const total = carregamento.dados.length;
  return (
    <div className="absolute right-0 bottom-[86px] flex flex-col items-center gap-0 rounded-[12px] bg-white px-[18px] py-[14px] font-bold text-ink shadow-card">
      <span className="font-display text-[2rem] leading-none font-extrabold text-orange">
        {total.toLocaleString("pt-BR")}
      </span>
      <small className="text-muted">
        {total === 1 ? "palavra" : "palavras"}
      </small>
    </div>
  );
}
