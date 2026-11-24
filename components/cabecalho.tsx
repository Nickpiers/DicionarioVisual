"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { definirAltoContraste, useAltoContraste } from "@/lib/armazenamento";
import { ehModerador, sair, useSessao } from "@/lib/sessao";
import { Icone } from "./icone";
import { Marca } from "./marca";
import { ativoNoTopo, itensNavegacao } from "./navegacao";

const classeItemTopo = (ativo: boolean) =>
  `flex min-w-[112px] items-center justify-center gap-2 border-0 border-b-[3px] px-4 font-bold hover:border-focus hover:bg-white/[.07] hover:text-white ${
    ativo
      ? "border-focus bg-white/[.07] text-white"
      : "border-transparent bg-transparent text-[#dbeaff]"
  }`;

const classeItemConta =
  "flex min-h-12 w-full items-center gap-3 rounded-[10px] px-3 font-bold text-navy hover:bg-blue-soft";

const classeBotaoIcone =
  "size-12 place-items-center rounded-[10px] border-0 bg-white/10 text-white";

const versao = process.env.NEXT_PUBLIC_VERSAO;
const commit = process.env.NEXT_PUBLIC_COMMIT;
const dataBuild = process.env.NEXT_PUBLIC_DATA_BUILD;

/**
 * Versão do build no ar (package.json + commit), para conferir nos testes qual
 * publicação está aberta. A data e a hora do build aparecem ao passar o mouse.
 */
function VersaoDoSite() {
  return (
    <small
      className="font-mono text-xs leading-tight whitespace-nowrap text-[#dbeaff]/80 select-all"
      title={`Versão ${versao}, commit ${commit}, build de ${dataBuild}`}
    >
      v{versao}
      <span className="phone:hidden"> · {commit}</span>
    </small>
  );
}

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
  const [contaAberta, setContaAberta] = useState(false);
  const [rotaDoMenu, setRotaDoMenu] = useState(rota);
  const conta = useRef<HTMLDivElement>(null);
  const usuario = sessao.status === "autenticado" ? sessao.usuario : undefined;

  // Fecha os menus ao trocar de página.
  if (rotaDoMenu !== rota) {
    setRotaDoMenu(rota);
    setMenuAberto(false);
    setContaAberta(false);
  }

  useEffect(() => {
    if (!contaAberta) return;
    const fechar = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !conta.current?.contains(e.target as Node)
      ) {
        setContaAberta(false);
      }
    };
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", fechar);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", fechar);
    };
  }, [contaAberta]);

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
          <VersaoDoSite />
          <button
            type="button"
            className={`grid ${classeBotaoIcone}`}
            aria-pressed={altoContraste}
            aria-label="Alternar alto contraste"
            onClick={() => definirAltoContraste(!altoContraste)}
          >
            <Icone nome="contrast" />
          </button>
          <div ref={conta} className="relative">
            <button
              type="button"
              className="flex min-h-12 max-w-[220px] items-center gap-2 rounded-[10px] border border-white/40 bg-transparent px-[14px] font-bold text-white"
              aria-label={usuario ? `Conta de ${usuario.name}` : "Entrar na conta"}
              aria-haspopup={usuario ? "menu" : undefined}
              aria-expanded={usuario ? contaAberta : undefined}
              aria-controls={usuario ? "menu-conta" : undefined}
              onClick={() => {
                if (usuario) setContaAberta((aberta) => !aberta);
                else router.push("/entrar?para=%2Fcontribuir");
              }}
            >
              <Icone nome="user" className="flex-none" />
              <span className="truncate tablet:hidden">
                {usuario ? usuario.name.split(" ")[0] : "Entrar"}
              </span>
            </button>

            {usuario && contaAberta && (
              <div
                id="menu-conta"
                role="menu"
                aria-label="Conta"
                className="absolute top-full right-0 mt-2 flex w-[min(280px,calc(100vw_-_24px))] flex-col rounded-[14px] border border-line bg-white p-2 text-ink shadow-card"
              >
                <div className="border-b border-line px-3 pt-2 pb-3">
                  <strong className="block truncate text-navy">
                    {usuario.name}
                  </strong>
                  <small className="block truncate text-muted">
                    {usuario.email}
                  </small>
                </div>
                <Link role="menuitem" href="/contribuir/minhas" className={classeItemConta}>
                  <Icone nome="book" />
                  Minhas contribuições
                </Link>
                {ehModerador(usuario) && (
                  <>
                    <Link role="menuitem" href="/moderacao" className={classeItemConta}>
                      <Icone nome="shield" />
                      Moderação
                    </Link>
                    <Link role="menuitem" href="/moderacao/usuarios" className={classeItemConta}>
                      <Icone nome="user" />
                      Gestão de usuários
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className={`${classeItemConta} border-0 bg-transparent text-left text-red`}
                  onClick={async () => {
                    setContaAberta(false);
                    await sair();
                    router.push("/");
                  }}
                >
                  <Icone nome="x" />
                  Sair
                </button>
              </div>
            )}
          </div>
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
