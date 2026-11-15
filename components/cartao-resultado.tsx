import Link from "next/link";
import { contarSentidos, type Palavra } from "@/lib/palavras";
import { Icone } from "./icone";
import {
  classeBotao,
  classeLinkTexto,
  Eyebrow,
  IconeSinal,
  SeloSentidos,
} from "./ui";

/** Cartão de palavra nos resultados e no dicionário (.result-card). */
export function CartaoResultado({
  palavra,
  href,
}: {
  palavra: Palavra;
  href: string;
}) {
  return (
    <article className="flex min-h-[300px] gap-4 rounded-[14px] border border-line bg-white p-[22px] shadow-card tablet:min-h-0 phone:p-4">
      <IconeSinal tamanho={25} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-[10px] phone:flex-col">
          <h3 className="my-[6px] text-navy">{palavra.titulo}</h3>
          <SeloSentidos>{contarSentidos(palavra)}</SeloSentidos>
        </div>
        <Eyebrow>{palavra.categoria}</Eyebrow>
        <p className="text-muted">{palavra.descricao}</p>
        <Link href={href} className={`${classeLinkTexto} mt-auto self-start`}>
          Ver significados <Icone nome="arrow" tamanho={17} />
        </Link>
      </div>
    </article>
  );
}

/** Estado vazio (.empty-state). */
export function NenhumaPalavra() {
  return (
    <div className="mx-auto my-8 max-w-[560px] rounded-[14px] border border-line bg-white px-6 py-12 text-center">
      <Icone nome="search" tamanho={32} className="text-blue" />
      <h2 className="mt-3 mb-[6px]">Nenhuma palavra encontrada</h2>
      <p className="text-muted">
        Tente buscar outro termo ou contribua com uma nova palavra.
      </p>
      <Link href="/contribuir" className={classeBotao("primary")}>
        <Icone nome="plus" />
        <span>Contribuir</span>
      </Link>
    </div>
  );
}
