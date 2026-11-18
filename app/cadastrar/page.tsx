import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioCadastro } from "@/components/formulario-cadastro";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function CadastrarPage() {
  return (
    <Suspense fallback={null}>
      <FormularioCadastro />
    </Suspense>
  );
}
