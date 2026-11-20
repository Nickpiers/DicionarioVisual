import type { Metadata } from "next";
import { DicionarioCarregado } from "@/components/dicionario-carregado";

export const metadata: Metadata = {
  title: "Todas as palavras",
};

export default function PalavrasPage() {
  return <DicionarioCarregado />;
}
