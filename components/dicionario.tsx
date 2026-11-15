"use client";

import { useState } from "react";
import { filtrarDicionario, letrasDoFiltro } from "@/lib/palavras";
import { CampoBusca } from "./campo-busca";
import { CartaoResultado, NenhumaPalavra } from "./cartao-resultado";
import {
  classeCabecalhoResultados,
  classeFaixaBusca,
  classeSecao,
  classeTituloFaixa,
  Eyebrow,
} from "./ui";

const classeLetra =
  "min-h-12 min-w-12 rounded-[9px] border border-line bg-white px-3 font-extrabold text-navy hover:border-blue hover:bg-blue-soft";

export function Dicionario() {
  const [filtro, setFiltro] = useState("");
  const visiveis = filtrarDicionario(filtro);

  return (
    <main>
      <section className={classeFaixaBusca}>
        <div>
          <Eyebrow claro>Dicionário completo</Eyebrow>
          <h1 className={classeTituloFaixa}>Todas as palavras</h1>
          <p className="m-0 text-[#dbeaff]">
            Explore os termos cadastrados em ordem alfabética.
          </p>
        </div>
        <CampoBusca
          id="search-light"
          claro
          valor={filtro}
          aoMudar={setFiltro}
          aoEnviar={() => undefined}
        />
      </section>

      <section className={classeSecao}>
        <div className={classeCabecalhoResultados}>
          <div>
            <Eyebrow>Lista de A a Z</Eyebrow>
            <h2 className="mt-1 mb-0">
              {visiveis.length}
              {visiveis.length === 1
                ? " palavra cadastrada"
                : " palavras cadastradas"}
            </h2>
            <p className="mt-[6px] mb-0 text-muted">
              Cada cartão mostra a quantidade de sentidos disponíveis.
            </p>
          </div>
          <div
            className="flex max-w-[440px] flex-wrap justify-end gap-[7px] phone:justify-start"
            aria-label="Filtrar por letra"
          >
            {letrasDoFiltro.map((letra) => (
              <button
                key={letra}
                type="button"
                aria-pressed={filtro === letra}
                className={classeLetra}
                onClick={() => setFiltro(letra)}
              >
                {letra}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={filtro === ""}
              className={classeLetra}
              onClick={() => setFiltro("")}
            >
              Todas
            </button>
          </div>
        </div>

        {visiveis.length > 0 ? (
          <div className="grid grid-cols-3 gap-[18px] tablet:grid-cols-2 phone:grid-cols-1">
            {visiveis.map((palavra) => (
              <CartaoResultado
                key={palavra.slug}
                palavra={palavra}
                href={`/palavras/${palavra.slug}`}
              />
            ))}
          </div>
        ) : (
          <NenhumaPalavra />
        )}
      </section>
    </main>
  );
}
