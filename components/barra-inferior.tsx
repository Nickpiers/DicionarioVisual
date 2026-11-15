"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone } from "./icone";
import { ativoNaBarraInferior, itensNavegacao } from "./navegacao";

/** Navegação inferior fixa, exibida só no celular (.bottom-nav). */
export function BarraInferior() {
  return <BarraInferiorBase rota={usePathname()} />;
}

export function BarraInferiorBase({ rota }: { rota: string }) {
  return (
    <nav
      aria-label="Navegação móvel"
      className="hidden phone:fixed phone:inset-x-0 phone:bottom-0 phone:z-[60] phone:grid phone:h-[70px] phone:grid-cols-4 phone:border-t phone:border-line phone:bg-white phone:pb-[env(safe-area-inset-bottom)] phone:shadow-[0_-5px_20px_rgba(20,55,90,.12)]"
    >
      {itensNavegacao.map((item) => {
        const ativo = ativoNaBarraInferior(item, rota);
        const classe = `flex min-h-16 flex-col items-center justify-center gap-[3px] border-0 border-t-[3px] bg-transparent text-[.7rem] font-extrabold ${
          ativo ? "border-blue text-blue" : "border-transparent text-muted"
        }`;
        return (
          <Link
            key={item.rotulo}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={classe}
          >
            <Icone nome={item.icone} />
            <span>{item.rotulo}</span>
          </Link>
        );
      })}
    </nav>
  );
}
