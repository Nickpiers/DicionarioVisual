import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaProtegida } from "@/components/area-protegida";
import { GestaoUsuarios } from "@/components/gestao-usuarios";

export const metadata: Metadata = {
  title: "Gestão de usuários",
};

export default function GestaoUsuariosPage() {
  return (
    <Suspense fallback={null}>
      <AreaProtegida papel="admin">
        <GestaoUsuarios />
      </AreaProtegida>
    </Suspense>
  );
}
