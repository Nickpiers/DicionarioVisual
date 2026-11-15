"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  definirAltoContraste,
  useAltoContraste,
  useSessao,
} from "@/lib/armazenamento";
import { sair } from "@/lib/contribuicoes";
import { Icone } from "./icone";
import { Marca } from "./marca";
import { ativoNoTopo, itensNavegacao } from "./navegacao";

const classeItemTopo = (ativo: boolean) =>
  `flex min-w-[112px] items-center justify-center gap-2 border-0 border-b-[3px] px-4 font-bold hover:border-focus hover:bg-white/[.07] hover:text-white ${
    ativo
      ? "border-focus bg-white/[.07] text-white"
      : "border-transparent bg-transparent text-[#dbeaff]"
  }`;

const classeBotaoIcone =
  "size-12 place-items-center rounded-[10px] border-0 bg-white/10 text-white";

/** Cabeçalho que destaca o item da rota atual. */
export function Cabecalho() {
  return <CabecalhoBase rota={usePathname()} />;
}

/** Cabeçalho para uma rota conhecida (útil em testes e fallbacks). */
export function CabecalhoBase({ rota }: { rota: string }) {
  const altoContraste = useAltoContraste();
  const sessao = useSessao();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [rotaDoMenu, setRotaDoMenu] = useState(rota);

  // Fecha o menu ao trocar de página.
  if (rotaDoMenu !== rota) {
    setRotaDoMenu(rota);
    setMenuAberto(false);
  }

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", altoContraste);
  }, [altoContraste]);

  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-white/20 bg-navy text-white phone:h-16">
      <div className="mx-auto flex h-full w-[min(1280px,calc(100%_-_40px))] items-center justify-between gap-5 phone:w-[calc(100%_-_24px)]">
        <Marca noCabecalho />

        <nav
          className="flex h-full items-stretch tablet:hidden"
          aria-label="Navegação principal"
        >
          {itensNavegacao.map((item) => (
            <Link
              key={item.rotulo}
              href={item.href}
              aria-current={ativoNoTopo(item, rota) ? "page" : undefined}
              className={classeItemTopo(ativoNoTopo(item, rota))}
            >
              <Icone nome={item.icone} />
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`grid ${classeBotaoIcone}`}
            aria-pressed={altoContraste}
            aria-label="Alternar alto contraste"
            onClick={() => definirAltoContraste(!altoContraste)}
          >
            <Icone nome="contrast" />
          </button>
          <button
            type="button"
            className="flex min-h-12 items-center gap-2 rounded-[10px] border border-white/40 bg-transparent px-[14px] font-bold text-white"
            aria-label={sessao ? "Sair da conta" : "Entrar na conta"}
            onClick={async () => {
              if (sessao) {
                await sair();
                router.push("/");
              } else {
                router.push("/entrar?para=%2Fcontribuir");
              }
            }}
          >
            <Icone nome="user" />
            <span className="tablet:hidden">{sessao ? "Sair" : "Entrar"}</span>
          </button>
          <button
            type="button"
            className={`hidden tablet:grid phone:hidden ${classeBotaoIcone}`}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <Icone nome="menu" />
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav
          id="menu-principal"
          aria-label="Menu"
          className="absolute top-full right-5 mt-2 hidden w-60 flex-col rounded-[14px] border border-line bg-white p-2 text-ink shadow-card tablet:flex phone:hidden"
        >
          {itensNavegacao.map((item) => {
            const ativo = ativoNoTopo(item, rota);
            const classe = `flex min-h-12 items-center gap-3 rounded-[10px] px-3 font-bold hover:bg-blue-soft ${
              ativo ? "bg-blue-soft text-blue" : "text-navy"
            }`;
            return (
              <Link
                key={item.rotulo}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={classe}
                onClick={() => setMenuAberto(false)}
              >
                <Icone nome={item.icone} />
                {item.rotulo}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
