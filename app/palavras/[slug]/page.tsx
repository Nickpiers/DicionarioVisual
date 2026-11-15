import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConsultaSentidos } from "@/components/consulta-sentidos";
import { PainelLateral, PainelLateralBase } from "@/components/painel-lateral";
import { classeSecao, Eyebrow, SeloSentidos } from "@/components/ui";
import {
  buscarPalavra,
  capitalizar,
  contarSentidos,
  palavras,
} from "@/lib/palavras";

export function generateStaticParams() {
  return palavras.map((palavra) => ({ slug: palavra.slug }));
}

export async function generateMetadata(
  props: PageProps<"/palavras/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const palavra = buscarPalavra(slug);
  return {
    title: palavra ? capitalizar(palavra.titulo) : "Palavra não encontrada",
  };
}

/**
 * As palavras do mock são pré-renderizadas (generateStaticParams), então ler
 * `params` antes do Suspense não atrasa a navegação; e permite responder 404
 * de verdade para slugs inexistentes.
 */
export const instant = false;

export default async function PalavraPage(
  props: PageProps<"/palavras/[slug]">,
) {
  const { slug } = await props.params;
  const palavra = buscarPalavra(slug);
  if (!palavra) notFound();

  return (
    <main className="bg-canvas">
      <section
        className={`${classeSecao} grid grid-cols-[280px_1fr] items-start gap-7 tablet:grid-cols-1`}
      >
        <Suspense
          fallback={
            <PainelLateralBase palavra={palavra} consulta={palavra.titulo} />
          }
        >
          <PainelLateral palavra={palavra} />
        </Suspense>

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
