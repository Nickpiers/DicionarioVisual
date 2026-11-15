"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useHidratado, useSessao, type Papel } from "@/lib/armazenamento";

/**
 * Exibe o conteúdo só para quem tem o papel exigido. Sem permissão, leva à
 * tela de login correspondente e volta para cá depois de entrar.
 * (Autenticação mockada no navegador; o backend real deve validar também.)
 */
export function AreaProtegida({
  papel,
  children,
}: {
  papel: Papel;
  children: ReactNode;
}) {
  const hidratado = useHidratado();
  const sessao = useSessao();
  const router = useRouter();
  const rota = usePathname();
  const busca = useSearchParams().toString();
  const permitido =
    papel === "admin" ? sessao?.papel === "admin" : sessao !== null;

  useEffect(() => {
    if (hidratado && !permitido) {
      const destino = busca ? `${rota}?${busca}` : rota;
      router.replace(`/entrar?para=${encodeURIComponent(destino)}`);
    }
  }, [hidratado, permitido, rota, busca, router]);

  if (!hidratado || !permitido) return null;
  return children;
}
