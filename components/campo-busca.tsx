"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUSCA_PADRAO } from "@/lib/palavras";
import { Icone } from "./icone";

const estilos = {
  padrao: {
    form: "min-h-[58px] border-2 border-transparent shadow-card",
    input: "h-[46px]",
    botao: "size-[46px] bg-orange",
  },
  claro: {
    form: "min-h-[52px] border border-line shadow-none",
    input: "h-10",
    botao: "size-10 bg-navy",
  },
} as const;

/**
 * Campo de busca (.search-field). Por padrão, ao enviar, abre /busca?q=…
 * Quando `aoMudar` é informado, funciona como filtro controlado.
 */
export function CampoBusca({
  id,
  claro = false,
  valorInicial = "",
  valor,
  aoMudar,
  aoEnviar,
  className = "",
}: {
  id: string;
  claro?: boolean;
  valorInicial?: string;
  valor?: string;
  aoMudar?: (valor: string) => void;
  aoEnviar?: (valor: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const [interno, setInterno] = useState(valorInicial);
  const atual = valor ?? interno;
  const e = estilos[claro ? "claro" : "padrao"];

  return (
    <form
      role="search"
      className={`flex items-center gap-3 rounded-[12px] bg-white py-[5px] pr-[5px] pl-[18px] text-navy focus-within:border-focus phone:min-h-14 ${e.form} ${className}`}
      onSubmit={(evento) => {
        evento.preventDefault();
        if (aoEnviar) return aoEnviar(atual);
        const termo = atual.trim() || BUSCA_PADRAO;
        router.push(`/busca?q=${encodeURIComponent(termo)}`);
      }}
    >
      <Icone nome="search" tamanho={22} />
      <label className="sr-only" htmlFor={id}>
        Buscar palavra
      </label>
      <input
        id={id}
        value={atual}
        onChange={(evento) => {
          setInterno(evento.target.value);
          aoMudar?.(evento.target.value);
        }}
        placeholder="Busque uma palavra"
        autoComplete="off"
        className={`w-full min-w-0 border-0 bg-transparent text-ink outline-0 ${e.input}`}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className={`grid flex-none place-items-center rounded-[9px] border-0 text-white ${e.botao}`}
      >
        <Icone nome="arrow" />
      </button>
    </form>
  );
}
