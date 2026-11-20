import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CarregandoResultados,
  ResultadosBusca,
} from "@/components/resultados-busca";

export const metadata: Metadata = {
  title: "Busca",
};

export default function BuscaPage() {
  return (
    <main>
      <Suspense fallback={<CarregandoResultados />}>
        <ResultadosBusca />
      </Suspense>
    </main>
  );
}
