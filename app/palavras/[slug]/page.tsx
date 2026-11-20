import type { Metadata } from "next";
import { Suspense } from "react";
import { DetalhePalavra } from "@/components/detalhe-palavra";
import { classeSecao } from "@/components/ui";

/**
 * Uma única página para todas as palavras, gerada como `/palavras/_/`.
 * O CloudFront entrega essa página para qualquer `/palavras/<slug>/` (e o
 * `next dev` faz o mesmo pelo rewrite do next.config); o componente lê o slug
 * do endereço e carrega a palavra no navegador.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export const metadata: Metadata = {
  title: "Palavra",
};

export default function PalavraPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-canvas">
          <section className={classeSecao}>
            <p role="status" className="m-0 text-muted">
              Carregando palavra…
            </p>
          </section>
        </main>
      }
    >
      <DetalhePalavra />
    </Suspense>
  );
}
