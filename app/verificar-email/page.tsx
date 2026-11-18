import type { Metadata } from "next";
import { Suspense } from "react";
import { VerificacaoEmail } from "@/components/verificacao-email";

export const metadata: Metadata = {
  title: "Confirmar e-mail",
};

/** Destino do link enviado por e-mail: /verificar-email?token=… */
export default function VerificarEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificacaoEmail />
    </Suspense>
  );
}
