"use client";

import Link from "next/link";
import { useRecentes } from "@/lib/armazenamento";
import {
  buscarPalavra,
  capitalizar,
  contarSentidos,
  type Palavra,
} from "@/lib/palavras";
import { Icone } from "./icone";
import { IconeSinal } from "./ui";

/** Lista das últimas palavras consultadas (.recent-list). */
export function BuscasRecentes() {
  const slugs = useRecentes();
  const recentes = slugs
    .map(buscarPalavra)
    .filter((p): p is Palavra => p !== undefined)
    .slice(0, 3);

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-white">
      {recentes.map((palavra) => (
        <Link
          key={palavra.slug}
          href={`/palavras/${palavra.slug}`}
          className="grid min-h-[76px] w-full grid-cols-[44px_1fr_auto] items-center gap-[14px] border-0 border-b border-line bg-transparent px-4 py-3 text-left last:border-b-0 hover:bg-blue-soft"
        >
          <IconeSinal />
          <span>
            <strong className="block">{capitalizar(palavra.titulo)}</strong>
            <small className="block text-muted">
              {contarSentidos(palavra)}
            </small>
          </span>
          <Icone nome="arrow" />
        </Link>
      ))}
    </div>
  );
}
