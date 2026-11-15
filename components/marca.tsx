import Link from "next/link";
import { Icone } from "./icone";

/** Marca do dicionário (.brand). */
export function Marca({ noCabecalho = false }: { noCabecalho?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Ir para o início"
      className={`inline-flex min-h-12 items-center gap-[10px] border-0 bg-transparent p-0 font-display text-[1rem] font-extrabold ${
        noCabecalho ? "text-inherit phone:text-[.9rem]" : "text-white"
      }`}
    >
      <span
        className={`grid size-9 place-items-center rounded-[10px] border-2 border-current ${
          noCabecalho ? "phone:size-[34px]" : ""
        }`}
      >
        <Icone nome="book" />
      </span>
      <span>Dicionário Libras</span>
    </Link>
  );
}
