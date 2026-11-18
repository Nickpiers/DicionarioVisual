import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CampoBusca } from "@/components/campo-busca";
import { Icone } from "@/components/icone";
import { ListaResultados } from "@/components/lista-resultados";
import {
  classeBotao,
  classeFaixaBusca,
  classeSecao,
  classeTituloFaixa,
  Eyebrow,
} from "@/components/ui";
import { buscarPalavras } from "@/lib/api/servidor";
import { BUSCA_PADRAO } from "@/lib/palavras";

export const metadata: Metadata = {
  title: "Busca",
};

type ParametrosBusca = PageProps<"/busca">["searchParams"];

function primeiro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default function BuscaPage(props: PageProps<"/busca">) {
  return (
    <main>
      <Suspense fallback={<CarregandoResultados />}>
        <Resultados searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function Resultados({ searchParams }: { searchParams: ParametrosBusca }) {
  const parametros = await searchParams;
  const termo = primeiro(parametros.q)?.trim() || BUSCA_PADRAO;
  const palavras = await buscarPalavras(termo);
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

function CarregandoResultados() {
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
