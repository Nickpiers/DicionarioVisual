import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaProtegida } from "@/components/area-protegida";
import { MinhasContribuicoes } from "@/components/minhas-contribuicoes";

export const metadata: Metadata = {
  title: "Minhas contribuições",
};

export default function MinhasContribuicoesPage() {
  return (
    <Suspense fallback={null}>
      <AreaProtegida papel="user">
        <MinhasContribuicoes />
      </AreaProtegida>
    </Suspense>
  );
}
