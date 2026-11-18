"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mensagemDeErro } from "@/lib/api/erros";
import type { MinhaContribuicaoApi, SituacaoSentido } from "@/lib/api/tipos";
import {
  corSituacao,
  formatarData,
  listarMinhasContribuicoes,
  rotuloSituacao,
} from "@/lib/contribuicoes";
import { AvisoVerificacao } from "./aviso-verificacao";
import { Alerta } from "./campos";
import { Icone } from "./icone";
import { Botao, classeBotao, classeSecao, Eyebrow } from "./ui";

type Filtro = "TODAS" | SituacaoSentido;

const filtros: { valor: Filtro; rotulo: string }[] = [
  { valor: "TODAS", rotulo: "Todas" },
  { valor: "PENDING", rotulo: "Em análise" },
  { valor: "IN_RECORDING", rotulo: "Em gravação" },
  { valor: "APPROVED", rotulo: "Publicadas" },
  { valor: "REJECTED", rotulo: "Não aprovadas" },
];

const explicacao: Record<SituacaoSentido, string> = {
  PENDING: "A equipe ainda vai analisar esta sugestão.",
  IN_RECORDING: "Sugestão aceita! A equipe está gravando o sinal em Libras.",
  APPROVED: "Publicada no dicionário. Obrigado pela contribuição!",
  REJECTED: "Esta sugestão não foi aprovada.",
};

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; itens: MinhaContribuicaoApi[] };

export function EtiquetaSituacao({
  situacao,
  className = "",
}: {
  situacao: SituacaoSentido;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-[99px] px-[10px] py-[5px] text-center text-[.74rem] font-extrabold whitespace-nowrap ${corSituacao[situacao]} ${className}`}
    >
      {rotuloSituacao[situacao]}
    </span>
  );
}

async function carregarEstado(): Promise<Estado> {
  try {
    return { tipo: "pronto", itens: await listarMinhasContribuicoes() };
  } catch (erro) {
    return { tipo: "erro", mensagem: mensagemDeErro(erro) };
  }
}

export function MinhasContribuicoes() {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [filtro, setFiltro] = useState<Filtro>("TODAS");

  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    carregarEstado().then((novo) => ativo && setEstado(novo));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const itens = estado.tipo === "pronto" ? estado.itens : [];
  const contagem = (valor: Filtro) =>
    valor === "TODAS" ? itens.length : itens.filter((i) => i.status === valor).length;
  const visiveis =
    filtro === "TODAS" ? itens : itens.filter((i) => i.status === filtro);

  return (
    <main className="bg-canvas">
      <section className={classeSecao}>
        <div className="mb-7 flex items-end justify-between gap-6 phone:flex-col phone:items-start">
          <div>
            <Eyebrow>Área da comunidade</Eyebrow>
            <h1 className="my-[5px] text-navy">Minhas contribuições</h1>
            <p className="m-0 text-muted">
              Acompanhe a revisão de cada palavra e sentido que você enviou.
            </p>
          </div>
          <Link
            href="/contribuir"
            className={`${classeBotao("primary")} phone:w-full`}
          >
            <Icone nome="plus" />
            <span>Nova contribuição</span>
          </Link>
        </div>

        <AvisoVerificacao className="mt-0 mb-6" />

        <div
          className="mb-5 flex gap-2 overflow-x-auto border-b border-line"
          role="tablist"
          aria-label="Filtrar por situação"
        >
          {filtros.map(({ valor, rotulo }) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={filtro === valor}
              onClick={() => setFiltro(valor)}
              className={`flex min-h-[50px] flex-none items-center gap-2 border-0 border-b-[3px] bg-transparent px-[14px] font-extrabold whitespace-nowrap ${
                filtro === valor
                  ? "border-navy text-navy"
                  : "border-transparent text-muted"
              }`}
            >
              {rotulo}
              {estado.tipo === "pronto" && (
                <span className="min-w-6 rounded-[99px] bg-[#e1e8f0] px-[6px] py-[2px] text-[.76rem] text-ink">
                  {contagem(valor)}
                </span>
              )}
            </button>
          ))}
        </div>

        {estado.tipo === "carregando" && (
          <p role="status" className="m-0 py-6 text-muted">
            Carregando suas contribuições…
          </p>
        )}

        {estado.tipo === "erro" && (
          <Alerta>
            <span className="block">{estado.mensagem}</span>
            <Botao
              variante="secondary"
              className="mt-3"
              onClick={() => {
                setEstado({ tipo: "carregando" });
                setTentativa((t) => t + 1);
              }}
            >
              Tentar de novo
            </Botao>
          </Alerta>
        )}

        {estado.tipo === "pronto" && visiveis.length === 0 && (
          <div className="rounded-[14px] border border-line bg-white px-6 py-12 text-center">
            <Icone nome="book" tamanho={32} className="text-blue" />
            <h2 className="mt-3 mb-[6px] text-[1.3rem]">
              {itens.length === 0
                ? "Você ainda não enviou contribuições"
                : "Nenhuma contribuição nesta lista"}
            </h2>
            <p className="m-0 text-muted">
              {itens.length === 0
                ? "Envie uma palavra ou um novo sentido para ampliar o dicionário."
                : "Escolha outra aba para ver as demais."}
            </p>
          </div>
        )}

        {visiveis.length > 0 && (
          <ul className="m-0 grid list-none gap-3 p-0">
            {visiveis.map((item) => (
              <li
                key={item.senseId}
                className="rounded-[14px] border border-line bg-white p-5 shadow-card phone:p-4"
              >
                <div className="flex items-start justify-between gap-4 phone:flex-col phone:gap-2">
                  <div className="min-w-0">
                    <Eyebrow>
                      {item.type === "NEW_WORD" ? "Nova palavra" : "Novo sentido"}
                    </Eyebrow>
                    <h2 className="mt-1 mb-0 text-[1.3rem] break-words text-navy">
                      {item.term}{" "}
                      <span className="font-normal text-muted">— {item.title}</span>
                    </h2>
                  </div>
                  <EtiquetaSituacao situacao={item.status} />
                </div>
                <p className="mt-3 mb-0 text-muted">{explicacao[item.status]}</p>
                {item.reviewNote && (
                  <div className="mt-3 rounded-[10px] bg-orange-soft p-[14px]">
                    <strong className="block text-[.88rem]">
                      {item.status === "REJECTED"
                        ? "Motivo informado pela equipe"
                        : "Observação da equipe"}
                    </strong>
                    <p className="mt-1 mb-0">{item.reviewNote}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[.84rem] text-muted">
                  <span className="flex items-center gap-[6px]">
                    <Icone nome="calendar" tamanho={18} />
                    Enviada em {formatarData(item.submittedAt)}
                  </span>
                  {item.reviewedAt && (
                    <span className="flex items-center gap-[6px]">
                      <Icone nome="check" tamanho={18} />
                      Analisada em {formatarData(item.reviewedAt)}
                    </span>
                  )}
                  {item.status === "APPROVED" && (
                    <Link
                      href={`/palavras/${item.wordId}`}
                      className="ml-auto flex min-h-11 items-center gap-1 font-extrabold text-blue phone:ml-0"
                    >
                      Ver no dicionário <Icone nome="arrow" tamanho={17} />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
