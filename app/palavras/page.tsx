import type { Metadata } from "next";
import { Dicionario } from "@/components/dicionario";

export const metadata: Metadata = {
  title: "Todas as palavras",
};

export default function PalavrasPage() {
  return <Dicionario />;
}
