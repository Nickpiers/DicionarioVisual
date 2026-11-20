import Link from "next/link";
import { Suspense } from "react";
import { BuscasRecentes } from "@/components/buscas-recentes";
import { CampoBusca } from "@/components/campo-busca";
import { Icone } from "@/components/icone";
import {
  PalavrasEmDestaque,
  SugestaoDeBusca,
  TotalDePalavras,
} from "@/components/inicio-palavras";
import { classeLinkTexto, classeSecao, Eyebrow } from "@/components/ui";

const classeCabecalhoSecao =
  "mb-7 flex items-end justify-between gap-6 phone:flex-col phone:items-start";

export default function InicioPage() {
  return (
    <main>
      {/* Hero */}
      <section className="grid min-h-[520px] grid-cols-[1.15fr_.85fr] items-center gap-[60px] overflow-hidden bg-[radial-gradient(circle_at_84%_45%,#1763b0_0,#1763b0_14%,transparent_14.3%),linear-gradient(125deg,var(--navy-dark),var(--navy))] px-[max(24px,calc((100%_-_1180px)/2))] py-[72px] text-white tablet:min-h-auto tablet:grid-cols-1 tablet:px-8 tablet:py-[60px] phone:px-[18px] phone:pt-[46px] phone:pb-[52px]">
        <div className="max-w-[680px] tablet:m-auto tablet:text-center">
          <span className="mb-5 inline-flex items-center gap-[9px] font-bold text-[#d8ebff] tablet:justify-center">
            <Icone nome="hand" /> Libras para todos
          </span>
          <h1 className="mb-5 text-[clamp(2.7rem,5.5vw,5rem)] phone:text-[2.6rem]">
            Uma palavra.
            <br />
            <span className="text-[#ffb08f]">Vários sentidos.</span>
          </h1>
          <p className="mb-7 max-w-[650px] text-[1.2rem] text-[#e3effc] phone:text-[1.02rem]">
            Encontre o significado que procura e aprenda de forma visual,
            simples e acessível.
          </p>
          <CampoBusca id="search-main" className="max-w-[680px]" />
          <span className="mt-3 block min-h-[1.5em] text-[.88rem] text-[#cfdef1]">
            <Suspense fallback={null}>
              <SugestaoDeBusca />
            </Suspense>
          </span>
        </div>

        <div
          className="relative grid min-h-[350px] place-items-center tablet:hidden"
          aria-hidden="true"
        >
          <div className="absolute top-7 left-0 flex items-center gap-[10px] rounded-[12px] bg-white px-[18px] py-[14px] font-bold text-ink shadow-card">
            <Icone nome="hand" />
            <span>Aprenda em Libras</span>
          </div>
          <div className="grid aspect-square w-[260px] place-items-center rounded-full border-2 border-white/45 bg-white/8 text-[#a8d6ff] shadow-[0_0_0_28px_rgba(255,255,255,.035)]">
            <Icone nome="book" tamanho={80} />
          </div>
          <Suspense fallback={null}>
            <TotalDePalavras />
          </Suspense>
        </div>
      </section>

      {/* Palavras em destaque e buscas recentes */}
      <section
        className={`${classeSecao} grid grid-cols-2 gap-16 tablet:grid-cols-1 tablet:gap-10`}
      >
        <div>
          <div className={classeCabecalhoSecao}>
            <div>
              <Eyebrow>Comece por aqui</Eyebrow>
              <h2 className="mt-1 mb-0">Palavras do dicionário</h2>
            </div>
            <Link href="/palavras" className={classeLinkTexto}>
              Ver todas
            </Link>
          </div>
          <Suspense fallback={null}>
            <PalavrasEmDestaque />
          </Suspense>
        </div>

        <div>
          <div className={classeCabecalhoSecao}>
            <div>
              <Eyebrow>Continue aprendendo</Eyebrow>
              <h2 className="mt-1 mb-0">Buscas recentes</h2>
            </div>
          </div>
          <BuscasRecentes />
        </div>
      </section>
    </main>
  );
}
