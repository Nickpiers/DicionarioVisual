import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaProtegida } from "@/components/area-protegida";
import {
  FormularioContribuicao,
  type OpcaoPalavra,
} from "@/components/formulario-contribuicao";
import { listarPalavras } from "@/lib/api/servidor";

export const metadata: Metadata = {
  title: "Contribuir",
};

/** Palavras publicadas, para sugerir um novo sentido; vazio se a API falhar. */
async function opcoesDePalavra(): Promise<OpcaoPalavra[]> {
  try {
    return (await listarPalavras()).map(({ slug, titulo }) => ({ slug, titulo }));
  } catch {
    return [];
  }
}

async function Contribuicao() {
  const palavras = await opcoesDePalavra();
  return (
    <AreaProtegida papel="user">
      <FormularioContribuicao palavras={palavras} />
    </AreaProtegida>
  );
}

export default function ContribuirPage() {
  return (
    <Suspense fallback={null}>
      <Contribuicao />
    </Suspense>
  );
}
