"use client";

import Link from "next/link";
import { useRecentes } from "@/lib/armazenamento";
import { capitalizar } from "@/lib/palavras";
import { Icone } from "./icone";
import { IconeSinal } from "./ui";

const classeLinha =
  "grid min-h-[76px] w-full grid-cols-[44px_1fr_auto] items-center gap-[14px] border-0 border-b border-line bg-transparent px-4 py-3 text-left last:border-b-0 hover:bg-blue-soft";

/** Lista das últimas palavras consultadas (.recent-list). */
export function BuscasRecentes() {
  const recentes = useRecentes().slice(0, 4);

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-white">
      {recentes.length === 0 && (
        <p className="m-0 flex min-h-[76px] items-center gap-3 px-4 py-3 text-muted">
          <Icone nome="info" className="flex-none text-blue" />
          As palavras que você consultar vão aparecer aqui.
        </p>
      )}
      {recentes.map((recente) => (
        <Link
          key={recente.slug}
          href={`/palavras/${recente.slug}`}
          className={classeLinha}
        >
          <IconeSinal />
          <span>
            <strong className="block">{capitalizar(recente.titulo)}</strong>
            <small className="block text-muted">
              {recente.sentidos} {recente.sentidos === 1 ? "sentido" : "sentidos"}
            </small>
          </span>
          <Icone nome="arrow" />
        </Link>
      ))}
    </div>
  );
}
