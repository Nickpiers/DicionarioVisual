"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { sair, temPapel, useSessao, type Papel } from "@/lib/sessao";
import { Icone } from "./icone";
import { Botao, classeBotao, Eyebrow } from "./ui";

const classeFundo =
  "grid min-h-[calc(100dvh_-_168px)] place-items-center bg-canvas px-5 py-16 phone:px-[14px] phone:py-9";

/**
 * Exibe o conteúdo só para quem tem o papel exigido. Sem sessão, leva ao
 * login e volta para cá depois de entrar. A API valida tudo de novo; isto só
 * evita mostrar telas que a pessoa não pode usar.
 */
export function AreaProtegida({
  papel,
  children,
}: {
  papel: Papel;
  children: ReactNode;
}) {
  const sessao = useSessao();
  const router = useRouter();
  const rota = usePathname();
  const busca = useSearchParams().toString();
  const anonimo = sessao.status === "anonimo";

  useEffect(() => {
    if (anonimo) {
      const destino = busca ? `${rota}?${busca}` : rota;
      router.replace(`/entrar?para=${encodeURIComponent(destino)}`);
    }
  }, [anonimo, rota, busca, router]);

  if (sessao.status === "carregando" || anonimo) {
    return (
      <main className={classeFundo}>
        <p role="status" className="m-0 flex items-center gap-2 text-muted">
          <Icone nome="user" />
          {anonimo ? "Abrindo a tela de entrada…" : "Verificando sua sessão…"}
        </p>
      </main>
    );
  }

  if (!temPapel(sessao, papel)) return <SemPermissao />;
  return children;
}

function SemPermissao() {
  const router = useRouter();
  const rota = usePathname();
  return (
    <main className={classeFundo}>
      <section
        className="w-[min(100%,520px)] rounded-[18px] border border-line bg-white p-[34px] text-center shadow-card phone:px-[18px] phone:py-6"
        aria-labelledby="sem-permissao-titulo"
      >
        <span className="mx-auto mb-4 grid size-[58px] place-items-center rounded-[16px] bg-navy text-white">
          <Icone nome="shield" tamanho={30} />
        </span>
        <Eyebrow>Área restrita</Eyebrow>
        <h1
          id="sem-permissao-titulo"
          className="mt-[6px] mb-3 text-[2rem] text-navy"
        >
          Sua conta não tem acesso a esta área.
        </h1>
        <p className="text-muted">
          A moderação é feita por pessoas da administração. Se você deveria ter
          acesso, entre com a conta fornecida pela equipe.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 phone:grid-cols-1">
          <Link href="/" className={classeBotao("secondary")}>
            <Icone nome="home" />
            <span>Voltar ao início</span>
          </Link>
          <Botao
            icone="user"
            onClick={async () => {
              await sair();
              router.replace(`/entrar?para=${encodeURIComponent(rota)}`);
            }}
          >
            Trocar de conta
          </Botao>
        </div>
      </section>
    </main>
  );
}
