import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaProtegida } from "@/components/area-protegida";
import { PainelModeracao } from "@/components/painel-moderacao";

export const metadata: Metadata = {
  title: "Moderação",
};

export default function ModeracaoPage() {
  return (
    <Suspense fallback={null}>
      <AreaProtegida papel="admin">
        <PainelModeracao />
      </AreaProtegida>
    </Suspense>
  );
}
