"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import NaoEncontrado from "@/app/not-found";
import { buscarPalavras, obterPalavra, useCarregar } from "@/lib/api/publico";
import { capitalizar, contarSentidos, type Palavra } from "@/lib/palavras";
import { ConsultaSentidos } from "./consulta-sentidos";
import { PainelLateralBase } from "./painel-lateral";
import { classeSecao, Eyebrow, SeloSentidos } from "./ui";

/**
 * O site é estático: existe uma única página para todas as palavras
 * (`/palavras/_/`), e o CloudFront entrega essa página para qualquer
 * `/palavras/<slug>/`. A palavra é lida do endereço e carregada no navegador,
 * então palavras aprovadas depois da publicação também funcionam.
 */
function semInscricao() {
  return () => {};
}

/** Slug da palavra no endereço; `null` no build (sem navegador) e na hidratação. */
function useSlugDoEndereco() {
  // A rota interna é sempre "_"; o slug real está no endereço do navegador.
  // usePathname só serve para renderizar de novo quando a navegação muda de palavra.
  usePathname();
  const caminho = useSyncExternalStore(
    semInscricao,
    () => window.location.pathname,
    () => null,
  );
  if (caminho === null) return null;
  const partes = caminho.split("/").filter(Boolean);
  const valor = partes[0] === "palavras" && partes[1] ? decodeURIComponent(partes[1]) : "";
  return valor.toLowerCase();
}

export function DetalhePalavra() {
  const slug = useSlugDoEndereco();
  const carregamento = useCarregar(slug || null, () => obterPalavra(slug ?? ""));

  const palavra = carregamento.estado === "pronto" ? carregamento.dados : undefined;
  useEffect(() => {
    if (palavra) document.title = `${capitalizar(palavra.titulo)} · Dicionário Libras`;
    else if (palavra === null) document.title = "Palavra não encontrada · Dicionário Libras";
  }, [palavra]);

  if (slug === "") return <NaoEncontrado />;
  if (carregamento.estado === "erro") throw carregamento.erro;
  if (carregamento.estado === "carregando" || slug === null) {
    return (
      <main className="bg-canvas">
        <section className={classeSecao}>
          <p role="status" className="m-0 text-muted">
            Carregando palavra…
          </p>
        </section>
      </main>
    );
  }
  if (!carregamento.dados) return <NaoEncontrado />;
  return <Pagina palavra={carregamento.dados} />;
}

function Pagina({ palavra }: { palavra: Palavra }) {
  return (
    <main className="bg-canvas">
      <section
        className={`${classeSecao} grid grid-cols-[280px_1fr] items-start gap-7 tablet:grid-cols-1`}
      >
        <PainelLateral palavra={palavra} />

        <div className="min-w-0">
          <div className="mb-7 flex items-start justify-between gap-6 phone:flex-col phone:items-start">
            <div>
              <Eyebrow>Consulta polissêmica</Eyebrow>
              <h1 className="mt-1 mb-2 text-navy">
                {`${palavra.titulo} `}
                <SeloSentidos className="align-middle text-[.8rem]">
                  {contarSentidos(palavra)}
                </SeloSentidos>
              </h1>
              <p className="m-0 text-muted">
                Uma palavra pode ter significados diferentes. Escolha um sentido
                para aprender.
              </p>
            </div>
          </div>

          <ConsultaSentidos key={palavra.slug} palavra={palavra} />
        </div>
      </section>
    </main>
  );
}

/** Painel "Buscar outra palavra" com os resultados da busca de origem (?q=). */
function PainelLateral({ palavra }: { palavra: Palavra }) {
  const consulta = useSearchParams().get("q")?.trim() || palavra.titulo;
  const carregamento = useCarregar(consulta, () => buscarPalavras(consulta));
  const encontrados = carregamento.estado === "pronto" ? carregamento.dados : [];
  return (
    <PainelLateralBase
      key={consulta}
      palavra={palavra}
      consulta={consulta}
      // Enquanto carrega, ou se a busca falhar, o painel mostra só a palavra atual.
      resultados={encontrados.length > 0 ? encontrados : [palavra]}
    />
  );
}
