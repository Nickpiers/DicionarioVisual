import Link from "next/link";
import { BuscasRecentes } from "@/components/buscas-recentes";
import { CampoBusca } from "@/components/campo-busca";
import { Icone, type NomeIcone } from "@/components/icone";
import {
  classeIconeQuadrado,
  classeLinkTexto,
  classeSecao,
  Eyebrow,
} from "@/components/ui";
import { categoriasDaHome } from "@/lib/palavras";

const estiloCategoria: { icone: NomeIcone; cor: string }[] = [
  { icone: "shield", cor: "bg-blue-soft text-navy" },
  { icone: "home", cor: "bg-[#fff5c7] text-[#725200]" },
  { icone: "plus", cor: "bg-orange-soft text-[#8a2d16]" },
  { icone: "user", cor: "bg-[#f0e9ff] text-[#4b317b]" },
];

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
          <span className="mt-3 block text-[.88rem] text-[#cfdef1]">
            Experimente: banco, manga ou casa
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
          <div className="absolute right-0 bottom-[30px] flex flex-col items-center gap-0 rounded-[12px] bg-white px-[18px] py-[14px] font-bold text-ink shadow-card">
            <span className="font-display text-[2rem] leading-none font-extrabold text-orange">
              3
            </span>
            <small className="text-muted">sentidos</small>
          </div>
        </div>
      </section>

      {/* Categorias e buscas recentes */}
      <section
        className={`${classeSecao} grid grid-cols-2 gap-16 tablet:grid-cols-1 tablet:gap-10`}
      >
        <div>
          <div className={classeCabecalhoSecao}>
            <div>
              <Eyebrow>Navegue por temas</Eyebrow>
              <h2 className="mt-1 mb-0">Explore por categoria</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 phone:grid-cols-1">
            {categoriasDaHome.map((categoria, indice) => (
              <Link
                key={categoria}
                href={`/busca?categoria=${encodeURIComponent(categoria)}`}
                className="grid min-h-[76px] grid-cols-[46px_1fr_auto] items-center gap-3 rounded-[14px] border border-line bg-surface px-[14px] py-3 text-left font-bold shadow-[0_3px_12px_rgba(20,55,90,.04)] hover:-translate-y-0.5 hover:border-blue"
              >
                <span
                  className={`${classeIconeQuadrado} size-11 ${estiloCategoria[indice].cor}`}
                >
                  <Icone nome={estiloCategoria[indice].icone} />
                </span>
                <span>{categoria}</span>
                <Icone nome="arrow" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className={classeCabecalhoSecao}>
            <div>
              <Eyebrow>Continue aprendendo</Eyebrow>
              <h2 className="mt-1 mb-0">Buscas recentes</h2>
            </div>
            <Link href="/palavras" className={classeLinkTexto}>
              Ver todas
            </Link>
          </div>
          <BuscasRecentes />
        </div>
      </section>
    </main>
  );
}
