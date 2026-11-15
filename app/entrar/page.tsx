import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioEntrada } from "@/components/formulario-entrada";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <FormularioEntrada />
    </Suspense>
  );
}
