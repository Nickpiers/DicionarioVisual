import type { Metadata } from "next";
import { Dicionario } from "@/components/dicionario";
import { listarPalavras } from "@/lib/api/servidor";

export const metadata: Metadata = {
  title: "Todas as palavras",
};

export default async function PalavrasPage() {
  return <Dicionario palavras={await listarPalavras()} />;
}
