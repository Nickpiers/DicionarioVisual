"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icone } from "@/components/icone";
import { Botao, classeBotao, Eyebrow } from "@/components/ui";

/** Falha inesperada, quase sempre a API fora do ar. */
export default function Erro({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[calc(100dvh_-_168px)] place-items-center bg-canvas px-5 py-16 phone:px-[14px] phone:py-9">
      <section
        className="w-[min(100%,560px)] rounded-[18px] border border-line bg-white p-10 text-center shadow-card phone:px-[18px] phone:py-7"
        aria-labelledby="erro-titulo"
      >
        <span className="mx-auto mb-4 grid size-[64px] place-items-center rounded-full bg-orange-soft text-orange">
          <Icone nome="info" tamanho={30} />
        </span>
        <Eyebrow>Algo deu errado</Eyebrow>
        <h1 id="erro-titulo" className="mt-2 mb-3 text-[2rem] text-navy">
          Não foi possível carregar esta página.
        </h1>
        <p className="text-muted">
          O dicionário pode estar fora do ar por um instante. Tente de novo em
          alguns segundos.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 phone:grid-cols-1">
          <Link href="/" className={classeBotao("secondary")}>
            <Icone nome="home" />
            <span>Voltar ao início</span>
          </Link>
          <Botao icone="arrow" onClick={() => retry()}>
            Tentar de novo
          </Botao>
        </div>
      </section>
    </main>
  );
}
