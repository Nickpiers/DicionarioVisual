"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buscarPalavras, useCarregar } from "@/lib/api/publico";
import { BUSCA_PADRAO } from "@/lib/palavras";
import { CampoBusca } from "./campo-busca";
import { Icone } from "./icone";
import { ListaResultados } from "./lista-resultados";
import {
  classeBotao,
  classeFaixaBusca,
  classeSecao,
  classeTituloFaixa,
  Eyebrow,
} from "./ui";

/** Resultados da busca (?q=), carregados no navegador. */
export function ResultadosBusca() {
  const termo = useSearchParams().get("q")?.trim() || BUSCA_PADRAO;
  const carregamento = useCarregar(termo, () => buscarPalavras(termo));
  if (carregamento.estado === "carregando") return <CarregandoResultados />;
  if (carregamento.estado === "erro") throw carregamento.erro;
  const palavras = carregamento.dados;
  const rotulo = termo;

  return (
    <>
      <section className={classeFaixaBusca}>
        <div>
          <Eyebrow claro>Consulta do dicionário</Eyebrow>
          <h1 className={classeTituloFaixa}>
            Encontre uma palavra e seus sentidos.
          </h1>
          <p className="m-0 text-[#dbeaff]">
            Pesquise termos, veja os sinais e compare os contextos.
          </p>
        </div>
        <CampoBusca
          key={rotulo}
          id="search-light"
          claro
          valorInicial={termo}
        />
      </section>

      <section className={classeSecao}>
        <ListaResultados
          key={rotulo}
          palavras={palavras}
          rotulo={rotulo}
          termo={termo}
        />

        <aside className="mt-7 grid grid-cols-[auto_1fr_auto] items-center gap-[18px] rounded-[14px] border border-[#acd0f4] bg-blue-soft p-[22px] phone:grid-cols-[auto_1fr]">
          <span className="grid size-12 place-items-center rounded-full bg-blue text-white">
            <Icone nome="plus" />
          </span>
          <div>
            <strong>Não encontrou o que buscava?</strong>
            <p className="mt-[2px] mb-0 text-muted">
              Ajude a ampliar o dicionário enviando uma nova palavra.
            </p>
          </div>
          <Link
            href="/contribuir"
            className={`${classeBotao("secondary")} phone:col-span-full phone:w-full`}
          >
            <span>Cadastrar palavra</span>
          </Link>
        </aside>
      </section>
    </>
  );
}

export function CarregandoResultados() {
  return (
    <>
      <section className={classeFaixaBusca}>
        <div>
          <Eyebrow claro>Consulta do dicionário</Eyebrow>
          <h1 className={classeTituloFaixa}>
            Encontre uma palavra e seus sentidos.
          </h1>
          <p className="m-0 text-[#dbeaff]">
            Pesquise termos, veja os sinais e compare os contextos.
          </p>
        </div>
        <CampoBusca id="search-light" claro />
      </section>
      <section className={classeSecao}>
        <p role="status" className="m-0 text-muted">
          Buscando palavras…
        </p>
      </section>
    </>
  );
}
