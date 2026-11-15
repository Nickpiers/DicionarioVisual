import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaProtegida } from "@/components/area-protegida";
import { FormularioContribuicao } from "@/components/formulario-contribuicao";

export const metadata: Metadata = {
  title: "Contribuir",
};

export default function ContribuirPage() {
  return (
    <Suspense fallback={null}>
      <AreaProtegida papel="user">
        <FormularioContribuicao />
      </AreaProtegida>
    </Suspense>
  );
}
