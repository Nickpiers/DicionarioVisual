"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { mensagemDeErro } from "@/lib/api/erros";
import { useSessao, verificarEmail } from "@/lib/sessao";
import { AvisoVerificacao } from "./aviso-verificacao";
import { Icone } from "./icone";
import { classeBotao, Eyebrow } from "./ui";

type Estado =
  | { tipo: "verificando" }
  | { tipo: "sucesso" }
  | { tipo: "erro"; mensagem: string };

/**
 * Cada token vale uma vez. Guardar a promessa por token evita enviar o mesmo
 * token duas vezes quando o efeito roda de novo (Strict Mode, remontagem).
 */
const verificacoes = new Map<string, Promise<void>>();

function verificarUmaVez(token: string) {
  let promessa = verificacoes.get(token);
  if (!promessa) {
    promessa = verificarEmail(token);
    verificacoes.set(token, promessa);
  }
  return promessa;
}

const SEM_TOKEN: Estado = {
  tipo: "erro",
  mensagem: "O link está incompleto. Abra o link do e-mail novamente.",
};

export function VerificacaoEmail() {
  const token = useSearchParams().get("token")?.trim() ?? "";
  const sessao = useSessao();
  const [resultado, setResultado] = useState<{ token: string; estado: Estado }>();
  const estado: Estado = !token
    ? SEM_TOKEN
    : resultado?.token === token
      ? resultado.estado
      : { tipo: "verificando" };

  useEffect(() => {
    if (!token) return;
    let ativo = true;
    verificarUmaVez(token).then(
      () => ativo && setResultado({ token, estado: { tipo: "sucesso" } }),
      (erro) =>
        ativo &&
        setResultado({
          token,
          estado: { tipo: "erro", mensagem: mensagemDeErro(erro) },
        }),
    );
    return () => {
      ativo = false;
    };
  }, [token]);

  const logado = sessao.status === "autenticado";

  return (
    <main className="grid min-h-[calc(100dvh_-_168px)] place-items-center bg-[radial-gradient(circle_at_50%_16%,#e8f8ef,transparent_30%),var(--canvas)] px-5 py-16 phone:px-[14px] phone:py-9">
      <section
        className="w-[min(100%,600px)] rounded-[20px] border border-line bg-white p-12 text-center shadow-card phone:px-[18px] phone:pt-9 phone:pb-[22px]"
        aria-labelledby="verificacao-titulo"
        aria-live="polite"
      >
        {estado.tipo === "verificando" && (
          <>
            <span className="mx-auto mb-[22px] grid size-[76px] place-items-center rounded-full bg-blue-soft text-blue">
              <Icone nome="mail" tamanho={34} />
            </span>
            <Eyebrow>Confirmação de e-mail</Eyebrow>
            <h1 id="verificacao-titulo" className="mt-2 mb-3 text-[2rem] text-navy">
              Confirmando seu e-mail…
            </h1>
            <p role="status" className="m-0 text-muted">
              Aguarde um instante.
            </p>
          </>
        )}

        {estado.tipo === "sucesso" && (
          <>
            <span className="mx-auto mb-[22px] grid size-[76px] place-items-center rounded-full bg-green text-white shadow-[0_0_0_12px_#e8f8ef]">
              <Icone nome="check" tamanho={36} />
            </span>
            <Eyebrow>E-mail confirmado</Eyebrow>
            <h1 id="verificacao-titulo" className="mt-2 mb-3 text-[2rem] text-navy">
              Tudo certo!
            </h1>
            <p className="text-muted">
              Seu e-mail foi confirmado. Agora você pode enviar palavras e
              sentidos para o dicionário.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 phone:grid-cols-1">
              <Link href="/" className={classeBotao("secondary")}>
                <Icone nome="home" />
                <span>Ir para o início</span>
              </Link>
              <Link
                href={logado ? "/contribuir" : "/entrar?para=%2Fcontribuir"}
                className={classeBotao("primary")}
              >
                <Icone nome="plus" />
                <span>{logado ? "Contribuir agora" : "Entrar e contribuir"}</span>
              </Link>
            </div>
          </>
        )}

        {estado.tipo === "erro" && (
          <>
            <span className="mx-auto mb-[22px] grid size-[76px] place-items-center rounded-full bg-orange-soft text-orange">
              <Icone nome="info" tamanho={34} />
            </span>
            <Eyebrow>Confirmação de e-mail</Eyebrow>
            <h1 id="verificacao-titulo" className="mt-2 mb-3 text-[2rem] text-navy">
              Não foi possível confirmar.
            </h1>
            <p role="alert" className="text-muted">
              {estado.mensagem}
            </p>
            {logado ? (
              <>
                <AvisoVerificacao className="text-left" />
                {sessao.usuario.emailVerified && (
                  <p className="text-muted">
                    Seu e-mail já está confirmado. Você já pode contribuir.
                  </p>
                )}
                <Link href="/contribuir" className={`${classeBotao("secondary")} mt-4 w-full`}>
                  <Icone nome="plus" />
                  <span>Ir para a contribuição</span>
                </Link>
              </>
            ) : (
              <>
                <p className="text-muted">
                  Entre na sua conta para pedir um novo link de confirmação.
                </p>
                <Link
                  href="/entrar?para=%2Fcontribuir"
                  className={`${classeBotao("primary")} mt-2 w-full`}
                >
                  <Icone nome="user" />
                  <span>Entrar na conta</span>
                </Link>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
