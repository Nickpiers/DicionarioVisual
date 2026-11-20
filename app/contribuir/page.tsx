import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaProtegida } from "@/components/area-protegida";
import { ContribuicaoCarregada } from "@/components/contribuicao-carregada";

export const metadata: Metadata = {
  title: "Contribuir",
};

export default function ContribuirPage() {
  return (
    <Suspense fallback={null}>
      <AreaProtegida papel="user">
        <ContribuicaoCarregada />
      </AreaProtegida>
    </Suspense>
  );
}
